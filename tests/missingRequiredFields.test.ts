import { describe, expect, it } from "vitest";
import { checkMissingRequiredFields } from "../src/rules/content/missingRequiredFields.js";

describe("checkMissingRequiredFields", () => {
  const options = {
    severity: "warning" as const,
    requiredFields: {
      post: ["body", "author", "seo.metaTitle"],
      page: ["content"]
    }
  };

  it("reports a document missing a required field", () => {
    const issues = checkMissingRequiredFields(
      [{ _id: "post-1", _type: "post", title: "My Post", author: "alice" }], // missing body and seo.metaTitle
      options
    );
    expect(issues).toHaveLength(2);
    expect(issues[0]?.ruleId).toBe("C007");
    expect(issues[0]?.message).toContain('"body"');
    expect(issues[1]?.message).toContain('"seo.metaTitle"');
  });

  it("reports a document with a null required field", () => {
    const issues = checkMissingRequiredFields(
      [{ _id: "post-1", _type: "post", body: null, author: "alice", seo: { metaTitle: "title" } }],
      options
    );
    expect(issues).toHaveLength(1);
    expect(issues[0]?.message).toContain('"body"');
  });

  it("reports a document with an empty string or whitespace-only field", () => {
    const issues = checkMissingRequiredFields(
      [{ _id: "post-1", _type: "post", body: "", author: "   ", seo: { metaTitle: "title" } }],
      options
    );
    expect(issues).toHaveLength(2);
  });

  it("does not report valid values such as false, 0, or empty arrays", () => {
    const issues = checkMissingRequiredFields(
      [{ _id: "post-1", _type: "post", body: [], author: 0, seo: { metaTitle: false } }],
      options
    );
    expect(issues).toHaveLength(0);
  });

  it("does not report documents with valid required fields", () => {
    const issues = checkMissingRequiredFields(
      [{ _id: "post-1", _type: "post", body: "text", author: "alice", seo: { metaTitle: "title" } }],
      options
    );
    expect(issues).toHaveLength(0);
  });

  it("ignores document types with no configured requirements", () => {
    const issues = checkMissingRequiredFields(
      [{ _id: "author-1", _type: "author" }], // 'author' is not in requiredFields
      options
    );
    expect(issues).toHaveLength(0);
  });
});
