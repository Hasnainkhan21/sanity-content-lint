import { describe, expect, it } from "vitest";
import { checkDuplicateContent } from "../src/rules/content/duplicateContent.js";

describe("checkDuplicateContent", () => {
  const options = {
    documentTypes: ["post", "page"],
    severity: "warning" as const,
    fields: ["title", "slug.current"],
  };

  it("does not report unique titles", () => {
    const issues = checkDuplicateContent(
      [
        { _id: "post-1", _type: "post", title: "First Post" },
        { _id: "post-2", _type: "post", title: "Second Post" },
      ],
      options
    );
    expect(issues).toHaveLength(0);
  });

  it("reports duplicate titles across the same document type", () => {
    const issues = checkDuplicateContent(
      [
        { _id: "post-1", _type: "post", title: "Same Title" },
        { _id: "post-2", _type: "post", title: "Same Title" },
      ],
      options
    );
    expect(issues).toHaveLength(2);
    expect(issues[0]?.ruleId).toBe("C006");
    expect(issues[0]?.message).toContain("duplicate title matching document(s): post-2");
    expect(issues[1]?.message).toContain("duplicate title matching document(s): post-1");
  });

  it("ignores missing or empty fields", () => {
    const issues = checkDuplicateContent(
      [
        { _id: "post-1", _type: "post", title: "" },
        { _id: "post-2", _type: "post", title: "   " },
        { _id: "post-3", _type: "post" },
      ],
      options
    );
    expect(issues).toHaveLength(0);
  });

  it("reports duplicate slugs", () => {
    const issues = checkDuplicateContent(
      [
        { _id: "post-1", _type: "post", slug: { current: "my-post" } },
        { _id: "post-2", _type: "post", slug: { current: "my-post" } },
      ],
      options
    );
    expect(issues).toHaveLength(2);
    expect(issues[0]?.message).toContain("duplicate slug");
  });

  it("reports duplicates case-insensitively", () => {
    const issues = checkDuplicateContent(
      [
        { _id: "post-1", _type: "post", title: "Hello World" },
        { _id: "post-2", _type: "post", title: "hello world" },
      ],
      options
    );
    expect(issues).toHaveLength(2);
  });

  it("ignores document types not listed in documentTypes", () => {
    const issues = checkDuplicateContent(
      [
        { _id: "post-1", _type: "post", title: "My Title" },
        { _id: "author-1", _type: "author", title: "My Title" },
      ],
      options
    );
    expect(issues).toHaveLength(0);
  });
});
