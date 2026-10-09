
/**
 * Rule C001 – Missing Title
 *
 * Reports documents whose `title` field is absent,
 * empty, or contains only whitespace.
 *
 * Think of this like spell-check for your content structure:
 * every important document type should have a non-blank title.
 */

// We import the shared types from the central types file.
// This avoids copy-pasting the same interface in every rule.
import type { LintSeverity, LintIssue } from "../types.js";

/**
 * The minimum shape of a document this rule needs to inspect.
 * The GROQ query already fetches `_id`, `_type`, and `title`,
 * so no query changes are required.
 */
export interface MissingTitleDocument {
  _id: string;
  _type: string;
  title?: string;
}

/**
 * Options you can pass when registering this rule in config.ts.
 *
 * - `documentTypes` – only documents with one of these `_type` values
 *   are checked. Documents with other types are silently skipped.
 * - `severity` – whether a violation is a "warning" or an "error".
 */
export interface MissingTitleOptions {
  documentTypes: string[];
  severity: LintSeverity;
}

/**
 * Check a list of documents for missing / blank titles.
 *
 * @param documents  Array of documents fetched from Sanity.
 * @param options    Rule configuration (which types to check, severity).
 * @returns          Array of LintIssue objects, one per offending document.
 *
 * Example
 * -------
 * ```ts
 * const issues = checkMissingTitle(documents, {
 *   documentTypes: ["post", "page"],
 *   severity: "error",
 * });
 * ```
 */
export function checkMissingTitle(
  documents: MissingTitleDocument[],
  options: MissingTitleOptions
): LintIssue[] {
  const issues: LintIssue[] = [];

  for (const document of documents) {
    // Skip document types that are not in scope for this rule.
    if (!options.documentTypes.includes(document._type)) {
      continue;
    }

    // A title is "missing" when it is:
    //   • undefined / null  (field not present in Sanity at all)
    //   • an empty string   ("")
    //   • only whitespace   ("   ")
    const titleIsMissing = !document.title?.trim();

    if (titleIsMissing) {
      issues.push({
        ruleId: "C001",
        severity: options.severity,
        category: "content",
        // Use the document ID as a fallback label since there's no title.
        message: `Document "${document._id}" is missing a title.`,
        documentId: document._id,
        documentType: document._type,
      });
    }
  }

  return issues;
}
