
import { describe, expect, it } from "vitest";
import { checkMissingSlug } from "../src/rules/content/missingSlug.js";

describe("checkMissingSlug", () => {
  const options = {
    documentTypes: ["post", "page"],
    severity: "warning" as const,
  };

  it("reports a document with no slug", () => {
    const issues = checkMissingSlug(
      [{ _id: "post-1", _type: "post", title: "Hello" }],
      options
    );

    expect(issues).toHaveLength(1);
    expect(issues[0]?.ruleId).toBe("C003");
  });

  it("ignores a document with a valid slug", () => {
    const issues = checkMissingSlug(
      [{
        _id: "post-2",
        _type: "post",
        title: "Hello",
        slug: { current: "hello" },
      }],
      options
    );

    expect(issues).toHaveLength(0);
  });

  it("ignores document types not configured for slugs", () => {
    const issues = checkMissingSlug(
      [{ _id: "settings-1", _type: "siteSettings" }],
      options
    );

    expect(issues).toHaveLength(0);
  });

  it("reports an empty slug", () => {
    const issues = checkMissingSlug(
      [{
        _id: "post-3",
        _type: "post",
        slug: { current: "" },
      }],
      options
    );

    expect(issues).toHaveLength(1);
  });

  it("reports a whitespace-only slug", () => {
    const issues = checkMissingSlug(
      [{
        _id: "post-4",
        _type: "post",
        slug: { current: " " },
      }],
      options
    );

    expect(issues).toHaveLength(1);
  });

  it("reports the correct issue details for multiple invalid documents", () => {
    const issues = checkMissingSlug(
      [
        { _id: "post-5", _type: "post", slug: { current: "" } },
        { _id: "page-1", _type: "page", slug: { current: " " } },
        { _id: "settings-2", _type: "siteSettings", slug: { current: "" } },
      ],
      options
    );

    expect(issues).toHaveLength(2);
    expect(issues).toEqual([
      expect.objectContaining({
        ruleId: "C003",
        severity: "warning",
        documentId: "post-5",
        documentType: "post",
      }),
      expect.objectContaining({
        ruleId: "C003",
        severity: "warning",
        documentId: "page-1",
        documentType: "page",
      }),
    ]);
  });

  it("uses the configured error severity", () => {
    const issues = checkMissingSlug(
      [{ _id: "post-6", _type: "post" }],
      { ...options, severity: "error" }
    );

    expect(issues[0]?.severity).toBe("error");
  });
});