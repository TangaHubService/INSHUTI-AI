import { describe, expect, it } from "vitest";

import { resolveFileTypeInfo, sanitizeFilename, isAllowedImageExtension } from "./healthEducationFiles.js";

describe("resolveFileTypeInfo", () => {
  it("resolves a pdf as raw/attachments", () => {
    expect(resolveFileTypeInfo("health-guide.pdf", "application/pdf")).toEqual({
      extension: "pdf",
      cloudinaryResourceType: "raw",
      folderCategory: "attachments",
    });
  });

  it("resolves an image as image/images", () => {
    expect(resolveFileTypeInfo("cover.png", "image/png")).toEqual({
      extension: "png",
      cloudinaryResourceType: "image",
      folderCategory: "images",
    });
  });

  it("resolves a video as video/videos", () => {
    expect(resolveFileTypeInfo("clip.mp4", "video/mp4")).toEqual({
      extension: "mp4",
      cloudinaryResourceType: "video",
      folderCategory: "videos",
    });
  });

  it("resolves audio under the video cloudinary resourceType but its own folder", () => {
    expect(resolveFileTypeInfo("podcast.mp3", "audio/mpeg")).toEqual({
      extension: "mp3",
      cloudinaryResourceType: "video",
      folderCategory: "audio",
    });
  });

  it("accepts docx, xlsx, pptx as raw/attachments", () => {
    expect(resolveFileTypeInfo("report.docx", "application/vnd.openxmlformats-officedocument.wordprocessingml.document")?.cloudinaryResourceType).toBe("raw");
    expect(resolveFileTypeInfo("sheet.xlsx", "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet")?.cloudinaryResourceType).toBe("raw");
    expect(resolveFileTypeInfo("deck.pptx", "application/vnd.openxmlformats-officedocument.presentationml.presentation")?.cloudinaryResourceType).toBe("raw");
  });

  it("rejects executables and unknown extensions", () => {
    expect(resolveFileTypeInfo("virus.exe", "application/x-msdownload")).toBeNull();
    expect(resolveFileTypeInfo("script.sh", "application/x-sh")).toBeNull();
    expect(resolveFileTypeInfo("no-extension", "application/octet-stream")).toBeNull();
  });

  it("rejects a filename whose extension doesn't match a mimetype known for a different allowed type", () => {
    // .pdf named file but the browser reports it as an mp4 mimetype — reject.
    expect(resolveFileTypeInfo("fake.pdf", "video/mp4")).toBeNull();
  });

  it("accepts an unrecognized/generic mimetype for an allowed extension", () => {
    expect(resolveFileTypeInfo("notes.csv", "application/octet-stream")).toEqual({
      extension: "csv",
      cloudinaryResourceType: "raw",
      folderCategory: "attachments",
    });
  });
});

describe("isAllowedImageExtension", () => {
  it("accepts common image extensions", () => {
    expect(isAllowedImageExtension("cover.jpg")).toBe(true);
    expect(isAllowedImageExtension("cover.webp")).toBe(true);
  });

  it("rejects non-image extensions", () => {
    expect(isAllowedImageExtension("guide.pdf")).toBe(false);
  });
});

describe("sanitizeFilename", () => {
  it("strips path traversal and separators", () => {
    expect(sanitizeFilename("../../etc/passwd.pdf")).not.toContain("..");
    expect(sanitizeFilename("../../etc/passwd.pdf")).not.toContain("/");
  });

  it("replaces unsafe characters and spaces", () => {
    expect(sanitizeFilename("my health guide!!.pdf")).toBe("my-health-guide.pdf");
  });

  it("caps length and never returns empty", () => {
    const long = "a".repeat(300) + ".pdf";
    expect(sanitizeFilename(long).length).toBeLessThanOrEqual(150);
    expect(sanitizeFilename("")).toBe("file");
    expect(sanitizeFilename("...")).toBe("file");
  });
});
