/**
 * Rule C004 – Missing Main Image
 *
 * Reports documents whose configured main image field is absent,
 * null, or an empty object.
 */

import type { LintSeverity, LintIssue } from "../types.js";

export interface MissingMainImageDocument {
  _id: string;
  _type: string;
  title?: string;
  [key: string]: any;
}

export interface MissingMainImageOptions {
  documentTypes: string[];
  severity: LintSeverity;
  fieldPath: string;
}

/**
 * Helper to get a nested value from an object using a dot-separated path.
 */
function getNestedValue(obj: any, path: string): any {
  const parts = path.split(".");
  let current = obj;
  for (const part of parts) {
    if (current == null) return undefined;
    current = current[part];
  }
  return current;
}

export function checkMissingMainImage(
  documents: MissingMainImageDocument[],
  options: MissingMainImageOptions
): LintIssue[] {
  const issues: LintIssue[] = [];

  for (const document of documents) {
    if (!options.documentTypes.includes(document._type)) {
      continue;
    }

    const value = getNestedValue(document, options.fieldPath);
    
    // Check if missing, null, or empty object. A valid Sanity image has an 'asset' object.
    const isMissing = !value || typeof value !== 'object' || !value.asset;

    if (isMissing) {
      issues.push({
        ruleId: "C004",
        severity: options.severity,
        category: "content",
        message: `Document "${document.title ?? document._id}" is missing an image at path "${options.fieldPath}".`,
        documentId: document._id,
        documentType: document._type,
        ...(document.title ? { documentTitle: document.title } : {}),
      });
    }
  }

  return issues;
}
