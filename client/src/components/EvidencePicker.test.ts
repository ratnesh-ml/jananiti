import { describe, expect, it } from "vitest";
import { evidenceKindForFile } from "./EvidencePicker";

describe("evidence picker classification", () => {
  it("classifies media types for the explicit picker actions", () => {
    expect(evidenceKindForFile(new File(["x"], "photo.jpg", { type: "image/jpeg" }))).toBe("photo");
    expect(evidenceKindForFile(new File(["x"], "note.webm", { type: "audio/webm" }))).toBe("audio");
    expect(evidenceKindForFile(new File(["x"], "clip.mp4", { type: "video/mp4" }))).toBe("video");
  });

  it("treats accepted non-media evidence as a document", () => {
    expect(evidenceKindForFile(new File(["x"], "brief.pdf", { type: "application/pdf" }))).toBe("document");
    expect(evidenceKindForFile(null)).toBeNull();
  });
});
