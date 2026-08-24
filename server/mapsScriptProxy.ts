import type { Express } from "express";
import { ENV } from "./_core/env";

const permittedLibraries = new Set(["marker", "places", "geocoding", "geometry", "drawing", "visualization"]);

/**
 * Serves the Google Maps JavaScript bootstrap through the application origin.
 * The Forge credential is added only on the server; the browser receives the
 * JavaScript payload and never the proxy authorization token.
 */
export function registerMapsScriptProxy(app: Express) {
  app.get("/api/maps/js", async (req, res) => {
    if (!ENV.forgeApiUrl || !ENV.forgeApiKey) {
      res.status(503).json({ message: "Map service is not configured." });
      return;
    }

    const upstream = new URL(
      `${ENV.forgeApiUrl.replace(/\/$/, "")}/v1/maps/proxy/maps/api/js`
    );
    upstream.searchParams.set("key", ENV.forgeApiKey);
    upstream.searchParams.set("v", typeof req.query.v === "string" ? req.query.v : "weekly");

    const requestedLibraries = typeof req.query.libraries === "string"
      ? req.query.libraries.split(",").filter(library => permittedLibraries.has(library))
      : [];
    if (requestedLibraries.length > 0) {
      upstream.searchParams.set("libraries", requestedLibraries.join(","));
    }

    try {
      const response = await fetch(upstream);
      if (!response.ok) {
        const details = await response.text();
        console.error("[Maps] Script bootstrap failed", response.status, details.slice(0, 300));
        res.status(502).json({ message: "Map service is temporarily unavailable." });
        return;
      }

      res.setHeader("Content-Type", response.headers.get("content-type") ?? "application/javascript");
      res.setHeader("Cache-Control", "private, max-age=300");
      res.send(await response.text());
    } catch (error) {
      console.error("[Maps] Script proxy request failed", error);
      res.status(502).json({ message: "Map service is temporarily unavailable." });
    }
  });
}
