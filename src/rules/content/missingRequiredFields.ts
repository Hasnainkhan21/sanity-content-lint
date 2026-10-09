/**
 * Rule C007 – Missing Required Fields
 *
 * Reports documents missing specific configured fields based on document type.
 */

import type { LintSeverity, LintIssue } from "../types.js";

export interface MissingRequiredFieldsDocument {
  _id: string;
  _type: string;
  title?: string;
  [key: string]: any;
}

export interface MissingRequiredFieldsOptions {
  severity: LintSeverity;
  // A mapping of document type (e.g. 'post') to an array of required field paths.
  requiredFields: Record<string, string[]>;
}

function getNestedValue(obj: any, path: string): any {
  const parts = path.split(".");
  let current = obj;
  for (const part of parts) {
    if (current == null) return undefined;
    current = current[part];
  }
  return current;
}

export function checkMissingRequiredFields(
  documents: MissingRequiredFieldsDocument[],
  options: MissingRequiredFieldsOptions
): LintIssue[] {
  const issues: LintIssue[] = [];

  for (const doc of documents) {
    const fieldsToCheck = options.requiredFields[doc._type];
    if (!fieldsToCheck || !Array.isArray(fieldsToCheck)) {
      continue;
    }

    for (const fieldPath of fieldsToCheck) {
      const value = getNestedValue(doc, fieldPath);
      
      let isMissing = false;
      
      if (value === undefined || value === null) {
        isMissing = true;
      } else if (typeof value === "string" && !value.trim()) {
        isMissing = true;
      }
      // Note: false, 0, and [] are treated as valid (not missing).

      if (isMissing) {
        issues.push({
          ruleId: "C007",
          severity: options.severity,
          category: "content",
          message: `Document "${doc.title ?? doc._id}" is missing required field "${fieldPath}".`,
          documentId: doc._id,
          documentType: doc._type,
          ...(doc.title ? { documentTitle: doc.title } : {}),
        });
      }
    }
  }

  return issues;
}
