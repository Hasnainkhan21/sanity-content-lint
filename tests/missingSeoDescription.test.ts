import { describe, expect, it } from "vitest";
import { checkMissingSeoDescription } from "../src/rules/content/missingSeoDescription.js";

describe("checkMissingSeoDescription", () => {
  const options = {
    documentTypes: ["post", "page"],
    severity: "warning" as const,
    fieldPath: "seo.metaDescription",
  };

  it("reports a document with a missing nested field", () => {
    const issues = checkMissingSeoDescription(
      [{ _id: "post-1", _type: "post", title: "My Post", seo: {} }],
      options
    );
    expect(issues).toHaveLength(1);
    expect(issues[0]?.ruleId).toBe("C002");
    expect(issues[0]?.documentId).toBe("post-1");
  });

  it("reports a document with an empty description", () => {
    const issues = checkMissingSeoDescription(
      [{ _id: "post-2", _type: "post", seo: { metaDescription: "" } }],
      options
    );
    expect(issues).toHaveLength(1);
  });

  it("reports a document with a whitespace-only description", () => {
    const issues = checkMissingSeoDescription(
      [{ _id: "post-3", _type: "post", seo: { metaDescription: "   " } }],
      options
    );
    expect(issues).toHaveLength(1);
  });

  it("does not report a document with a valid description", () => {
    const issues = checkMissingSeoDescription(
      [{ _id: "post-4", _type: "post", seo: { metaDescription: "Good SEO text" } }],
      options
    );
    expect(issues).toHaveLength(0);
  });

  it("ignores document types not listed in documentTypes", () => {
    const issues = checkMissingSeoDescription(
      [{ _id: "author-1", _type: "author", seo: { metaDescription: "" } }],
      options
    );
    expect(issues).toHaveLength(0);
  });

  it("supports top-level field paths", () => {
    const issues = checkMissingSeoDescription(
      [{ _id: "post-5", _type: "post", metaDescription: "   " }],
      { ...options, fieldPath: "metaDescription" }
    );
    expect(issues).toHaveLength(1);
    expect(issues[0]?.message).toContain('at path "metaDescription"');
  });
});
