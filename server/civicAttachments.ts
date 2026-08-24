import type { Express } from "express";
import express from "express";
import path from "node:path";
import { sdk } from "./_core/sdk";
import { addCivicItemUpdate, getCivicItemByPublicId, saveCivicAttachment } from "./db";
import { storagePut } from "./storage";

const MAX_ATTACHMENT_BYTES = 10 * 1024 * 1024;
const allowedDocumentTypes = new Set(["application/pdf", "text/plain"]);

function classifyMimeType(mimeType: string): "image" | "audio" | "document" | null {
  if (mimeType.startsWith("image/")) return "image";
  if (mimeType.startsWith("audio/")) return "audio";
  if (allowedDocumentTypes.has(mimeType)) return "document";
  return null;
}

function safeFilename(value: string) {
  const decoded = decodeURIComponent(value);
  const clean = path.basename(decoded).replace(/[^a-zA-Z0-9._-]/g, "_");
  return clean.slice(0, 180) || "attachment";
}

/** Registers ownership-checked binary uploads for civic evidence. */
export function registerCivicAttachmentRoutes(app: Express) {
  app.post(
    "/api/civic-items/:publicId/attachments",
    express.raw({ type: () => true, limit: `${MAX_ATTACHMENT_BYTES}b` }),
    async (req, res) => {
      const user = await sdk.authenticateRequest(req).catch(() => null);
      if (!user) {
        res.status(401).json({ message: "Sign in before uploading civic evidence." });
        return;
      }

      const civicItem = await getCivicItemByPublicId(req.params.publicId);
      if (!civicItem) {
        res.status(404).json({ message: "Civic request not found." });
        return;
      }
      if (civicItem.citizenId !== user.id && user.role !== "admin") {
        res.status(403).json({ message: "You cannot add evidence to this civic request." });
        return;
      }

      const mimeType = (req.header("content-type") ?? "").split(";")[0].trim().toLowerCase();
      const kind = classifyMimeType(mimeType);
      if (!kind) {
        res.status(415).json({ message: "Upload an image, audio recording, PDF, or text document." });
        return;
      }
      if (!Buffer.isBuffer(req.body) || req.body.length === 0) {
        res.status(400).json({ message: "The attachment could not be read." });
        return;
      }
      if (req.body.length > MAX_ATTACHMENT_BYTES) {
        res.status(413).json({ message: "Attachments must be 10 MB or smaller." });
        return;
      }

      const originalName = safeFilename(req.header("x-file-name") ?? "attachment");
      try {
        const stored = await storagePut(
          `jananiti/civic-items/${civicItem.publicId}/${originalName}`,
          req.body,
          mimeType
        );
        const attachment = await saveCivicAttachment({
          civicItemId: civicItem.id,
          uploadedById: user.id,
          storageKey: stored.key,
          originalName,
          mimeType,
          kind,
          sizeBytes: req.body.length,
        });
        await addCivicItemUpdate({
          publicId: civicItem.publicId,
          actorId: user.id,
          message: `Supporting ${kind} evidence was added for coordinator review.`,
          isPublic: false,
        });
        res.status(201).json({ attachment: { ...attachment, url: stored.url } });
      } catch (error) {
        console.error("[Civic attachments] Upload failed", error);
        res.status(500).json({ message: "The evidence upload could not be completed." });
      }
    }
  );
}
