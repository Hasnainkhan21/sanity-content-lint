
import { describe, expect, it } from "vitest";
import { checkMissingTitle } from "../src/rules/content/missingTitle.js";

/**
 * Tests for Rule C001 – Missing Title.
 *
 * We test four classes of "bad" title and one "good" case,
 * plus a check that ignored document types are never flagged.
 */
describe("checkMissingTitle", () => {
  // Default options shared across most tests.
  // Only "post" and "page" documents are checked.
  const options = {
    documentTypes: ["post", "page"],
    severity: "warning" as const,
  };

  // ── Bad title cases ────────────────────────────────────────────────────────

  it("reports a document with no title field at all", () => {
    // The document has no `title` property – the field is completely absent.
    const issues = checkMissingTitle(
      [{ _id: "post-1", _type: "post" }],
      options
    );

    expect(issues).toHaveLength(1);
    expect(issues[0]?.ruleId).toBe("C001");
    expect(issues[0]?.documentId).toBe("post-1");
  });

  it("reports a document with an empty string title", () => {
    // The field exists but is an empty string "".
    const issues = checkMissingTitle(
      [{ _id: "post-2", _type: "post", title: "" }],
      options
    );

    expect(issues).toHaveLength(1);
    expect(issues[0]?.ruleId).toBe("C001");
  });

  it("reports a document with a whitespace-only title", () => {
    // The field contains spaces / tabs but no real text.
    const issues = checkMissingTitle(
      [{ _id: "post-3", _type: "post", title: "   " }],
      options
    );

    expect(issues).toHaveLength(1);
    expect(issues[0]?.ruleId).toBe("C001");
  });

  // ── Good title case ────────────────────────────────────────────────────────

  it("does not report a document with a valid title", () => {
    // A normal, non-blank title should produce zero issues.
    const issues = checkMissingTitle(
      [{ _id: "post-4", _type: "post", title: "Hello World" }],
      options
    );

    expect(issues).toHaveLength(0);
  });

  // ── Ignored document types ─────────────────────────────────────────────────

  it("ignores document types not listed in documentTypes", () => {
    // "siteSettings" is not in options.documentTypes, so it must be skipped
    // even if its title is missing.
    const issues = checkMissingTitle(
      [{ _id: "settings-1", _type: "siteSettings" }],
      options
    );

    expect(issues).toHaveLength(0);
  });

  // ── Severity passthrough ───────────────────────────────────────────────────

  it("uses 'error' severity when configured", () => {
    const issues = checkMissingTitle(
      [{ _id: "post-5", _type: "post" }],
      { ...options, severity: "error" }
    );

    expect(issues[0]?.severity).toBe("error");
  });

  it("uses 'warning' severity when configured", () => {
    const issues = checkMissingTitle(
      [{ _id: "post-6", _type: "post" }],
      { ...options, severity: "warning" }
    );

    expect(issues[0]?.severity).toBe("warning");
  });

  // ── Issue shape ────────────────────────────────────────────────────────────

  it("populates all required fields on the returned issue", () => {
    const issues = checkMissingTitle(
      [{ _id: "page-1", _type: "page" }],
      options
    );

    expect(issues[0]).toMatchObject({
      ruleId: "C001",
      severity: "warning",
      category: "content",
      documentId: "page-1",
      documentType: "page",
    });
    // The message must mention the document ID since there's no title to use.
    expect(issues[0]?.message).toContain("page-1");
  });

  // ── Mixed batch ───────────────────────────────────────────────────────────

  it("handles a mixed batch of valid, invalid, and ignored documents", () => {
    const documents = [
      { _id: "post-ok",      _type: "post",         title: "Good title" },
      { _id: "post-blank",   _type: "post",         title: "" },
      { _id: "page-spaces",  _type: "page",         title: "  " },
      { _id: "settings-1",   _type: "siteSettings"  /* ignored */ },
    ];

    const issues = checkMissingTitle(documents, options);

    // Only the two "bad" ones (post-blank and page-spaces) should be flagged.
    expect(issues).toHaveLength(2);
    expect(issues.map((i) => i.documentId)).toEqual(
      expect.arrayContaining(["post-blank", "page-spaces"])
    );
  });
});
