/**
 * Rule C002 – Missing SEO Description
 *
 * Reports documents whose SEO description field is absent,
 * empty, or contains only whitespace.
 */

import type { LintSeverity, LintIssue } from "../types.js";

export interface MissingSeoDescriptionDocument {
  _id: string;
  _type: string;
  title?: string;
  [key: string]: any;
}

export interface MissingSeoDescriptionOptions {
  documentTypes: string[];
  severity: LintSeverity;
  fieldPath: string;
}

/**
 * Helper to get a nested value from an object using a dot-separated path.
 */
function getNestedValue(obj: any, path: string): string | undefined {
  const parts = path.split(".");
  let current = obj;
  for (const part of parts) {
    if (current == null) return undefined;
    current = current[part];
  }
  return typeof current === "string" ? current : undefined;
}

export function checkMissingSeoDescription(
  documents: MissingSeoDescriptionDocument[],
  options: MissingSeoDescriptionOptions
): LintIssue[] {
  const issues: LintIssue[] = [];

  for (const document of documents) {
    if (!options.documentTypes.includes(document._type)) {
      continue;
    }

    const value = getNestedValue(document, options.fieldPath);
    const isMissing = !value?.trim();

    if (isMissing) {
      issues.push({
        ruleId: "C002",
        severity: options.severity,
        category: "content",
        message: `Document "${document.title ?? document._id}" is missing an SEO description at path "${options.fieldPath}".`,
        documentId: document._id,
        documentType: document._type,
        ...(document.title ? { documentTitle: document.title } : {}),
      });
    }
  }

  return issues;
}
