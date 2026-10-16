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
    expect(issues[0]?.severity).toBe("warning");
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

  it("reports an image object with metadata but no asset reference", () => {
    const issues = checkMissingMainImage(
      [
        {
          _id: "post-3b",
          _type: "post",
          mainImage: {
            _type: "image",
            alt: "A placeholder hero image for lint testing",
          },
        },
      ],
      options
    );
    expect(issues).toHaveLength(1);
  });

  it("reports an image object with an empty asset object or null asset", () => {
    const issuesEmptyAsset = checkMissingMainImage(
      [{ _id: "post-3c", _type: "post", mainImage: { asset: {} } }],
      options
    );
    expect(issuesEmptyAsset).toHaveLength(1);

    const issuesNullAsset = checkMissingMainImage(
      [{ _id: "post-3d", _type: "post", mainImage: { asset: null } }],
      options
    );
    expect(issuesNullAsset).toHaveLength(1);

    const issuesEmptyRef = checkMissingMainImage(
      [{ _id: "post-3e", _type: "post", mainImage: { asset: { _ref: "" } } }],
      options
    );
    expect(issuesEmptyRef).toHaveLength(1);
  });

  it("does not report a document with a valid image object containing an asset reference", () => {
    const issues = checkMissingMainImage(
      [{ _id: "post-4", _type: "post", mainImage: { asset: { _ref: "image-123" } } }],
      options
    );
    expect(issues).toHaveLength(0);
  });

  it("does not report a document with a valid image object containing a dereferenced asset", () => {
    const issues = checkMissingMainImage(
      [
        {
          _id: "post-4b",
          _type: "post",
          mainImage: {
            asset: {
              _id: "image-123",
              url: "https://cdn.sanity.io/images/proj/data/image-123.jpg",
            },
          },
        },
      ],
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

  it("supports custom top-level field paths", () => {
    const customOptions = {
      ...options,
      fieldPath: "thumbnail",
    };
    const issuesMissing = checkMissingMainImage(
      [{ _id: "post-5a", _type: "post", thumbnail: null }],
      customOptions
    );
    expect(issuesMissing).toHaveLength(1);
    expect(issuesMissing[0]?.message).toContain('at path "thumbnail"');

    const issuesValid = checkMissingMainImage(
      [{ _id: "post-5b", _type: "post", thumbnail: { asset: { _ref: "thumb-1" } } }],
      customOptions
    );
    expect(issuesValid).toHaveLength(0);
  });

  it("supports nested field paths", () => {
    const issues = checkMissingMainImage(
      [{ _id: "post-5", _type: "post", seo: { thumbnail: null } }],
      { ...options, fieldPath: "seo.thumbnail" }
    );
    expect(issues).toHaveLength(1);
    expect(issues[0]?.message).toContain('at path "seo.thumbnail"');

    const issuesValid = checkMissingMainImage(
      [{ _id: "post-6", _type: "post", seo: { thumbnail: { asset: { _ref: "thumb-2" } } } }],
      { ...options, fieldPath: "seo.thumbnail" }
    );
    expect(issuesValid).toHaveLength(0);
  });

  it("supports configurable severity", () => {
    const issues = checkMissingMainImage(
      [{ _id: "post-7", _type: "post", mainImage: null }],
      { ...options, severity: "error" }
    );
    expect(issues).toHaveLength(1);
    expect(issues[0]?.severity).toBe("error");
  });
});
