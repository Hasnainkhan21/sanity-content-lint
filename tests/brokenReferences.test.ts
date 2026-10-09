import { describe, expect, it } from "vitest";
import { checkBrokenReferences } from "../src/rules/content/brokenReferences.js";

describe("checkBrokenReferences", () => {
  const options = {
    documentTypes: ["post", "page"],
    severity: "warning" as const,
  };

  it("does not report documents without references", () => {
    const issues = checkBrokenReferences(
      [
        { _id: "post-1", _type: "post", title: "Post 1", body: "Hello world" }
      ],
      options
    );
    expect(issues).toHaveLength(0);
  });

  it("does not report valid references", () => {
    const issues = checkBrokenReferences(
      [
        { _id: "post-1", _type: "post", title: "Post 1", author: { _type: "reference", _ref: "author-1" } },
        { _id: "author-1", _type: "author", name: "Alice" }
      ],
      options
    );
    expect(issues).toHaveLength(0);
  });

  it("reports a broken top-level reference", () => {
    const issues = checkBrokenReferences(
      [
        { _id: "post-1", _type: "post", title: "Post 1", author: { _type: "reference", _ref: "author-missing" } }
      ],
      options
    );
    expect(issues).toHaveLength(1);
    expect(issues[0]?.ruleId).toBe("C005");
    expect(issues[0]?.message).toContain('"author-missing"');
    expect(issues[0]?.message).toContain('at path "author"');
  });

  it("reports a broken nested reference in an array", () => {
    const issues = checkBrokenReferences(
      [
        { 
          _id: "post-1", 
          _type: "post", 
          title: "Post 1", 
          categories: [
            { _type: "reference", _ref: "cat-1" },
            { _type: "reference", _ref: "cat-missing" }
          ] 
        },
        { _id: "cat-1", _type: "category" }
      ],
      options
    );
    expect(issues).toHaveLength(1);
    expect(issues[0]?.message).toContain('"cat-missing"');
    expect(issues[0]?.message).toContain('at path "categories[1]"');
  });

  it("safely ignores image and file asset references", () => {
    const issues = checkBrokenReferences(
      [
        { _id: "post-1", _type: "post", title: "Post 1", image: { _type: "reference", _ref: "image-123" } },
        { _id: "post-2", _type: "post", title: "Post 2", file: { _type: "reference", _ref: "file-123" } }
      ],
      options
    );
    expect(issues).toHaveLength(0);
  });

  it("ignores document types not listed in documentTypes", () => {
    const issues = checkBrokenReferences(
      [
        { _id: "author-1", _type: "author", related: { _type: "reference", _ref: "missing-ref" } }
      ],
      options
    );
    expect(issues).toHaveLength(0);
  });

  it("handles malformed references safely", () => {
    const issues = checkBrokenReferences(
      [
        { _id: "post-1", _type: "post", title: "Post 1", badRef1: { _type: "reference" }, badRef2: { _ref: "something" } }
      ],
      options
    );
    expect(issues).toHaveLength(0);
  });
});
