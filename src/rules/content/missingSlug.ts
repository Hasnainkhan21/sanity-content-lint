
/**
 * Rule C003 – Missing Slug
 *
 * Reports documents whose `slug.current` field is absent,
 * empty, or contains only whitespace.
 */

// Import shared types from the central types file.
// We also re-export them so any code that was already importing
// LintIssue / LintSeverity from this file continues to work.
import type { LintSeverity, LintIssue } from "../types.js";
export type { LintSeverity, LintIssue };

/** Shape of each document returned by the GROQ query. */
export interface MissingSlugDocument {
  _id: string;
  _type: string;
  title?: string;
  slug?: {
    current?: string;
  };
}

/** Options accepted by checkMissingSlug. */
export interface MissingSlugOptions {
  documentTypes: string[];
  severity: LintSeverity;
}

/**
 * Check a list of documents for missing / blank slugs.
 * Only documents whose `_type` is listed in `options.documentTypes`
 * are inspected; all others are silently skipped.
 */
export function checkMissingSlug(
  documents: MissingSlugDocument[],
  options: MissingSlugOptions
): LintIssue[] {
  const issues: LintIssue[] = [];

  for (const document of documents) {
    if (!options.documentTypes.includes(document._type)) {
      continue;
    }

    if (!document.slug?.current?.trim()) {
      issues.push({
        ruleId: "C003",
        severity: options.severity,
        category: "content",
        message: `Document "${document.title ?? document._id}" is missing a slug.`,
        documentId: document._id,
        documentType: document._type,
        ...(document.title ? { documentTitle: document.title } : {}),
      });
    }
  }

  return issues;
}