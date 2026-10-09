import { describe, expect, it } from "vitest";
import { checkMissingMainImage } from "../src/rules/content/missingMainImage.js";

describe("checkMissingMainImage", () => {
  const options = {
    documentTypes: ["post", "page"],
    severity: "warning" as const,
    fieldPath: "mainImage",
  };

  it("reports a document with a missing image field", () => {
    const issues = checkMissingMainImage(
      [{ _id: "post-1", _type: "post", title: "My Post" }],
      options
    );
    expect(issues).toHaveLength(1);
    expect(issues[0]?.ruleId).toBe("C004");
  });

  it("reports a document with a null image field", () => {
    const issues = checkMissingMainImage(
      [{ _id: "post-2", _type: "post", mainImage: null }],
      options
    );
    expect(issues).toHaveLength(1);
  });

  it("reports a document with an empty image object", () => {
    const issues = checkMissingMainImage(
      [{ _id: "post-3", _type: "post", mainImage: {} }],
      options
    );
    expect(issues).toHaveLength(1);
  });

  it("does not report a document with a valid image object", () => {
    const issues = checkMissingMainImage(
      [{ _id: "post-4", _type: "post", mainImage: { asset: { _ref: "image-123" } } }],
      options
    );
    expect(issues).toHaveLength(0);
  });

  it("ignores document types not listed in documentTypes", () => {
    const issues = checkMissingMainImage(
      [{ _id: "author-1", _type: "author" }],
      options
    );
    expect(issues).toHaveLength(0);
  });

  it("supports nested field paths", () => {
    const issues = checkMissingMainImage(
      [{ _id: "post-5", _type: "post", seo: { thumbnail: null } }],
      { ...options, fieldPath: "seo.thumbnail" }
    );
    expect(issues).toHaveLength(1);
    expect(issues[0]?.message).toContain('at path "seo.thumbnail"');
  });
});
