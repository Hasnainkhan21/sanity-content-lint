/**
 * Rule C006 – Duplicate Content
 *
 * Detects duplicate documents based on configurable fields like title or slug.
 */

import type { LintSeverity, LintIssue } from "../types.js";

export interface DuplicateContentDocument {
  _id: string;
  _type: string;
  title?: string;
  [key: string]: any;
}

export interface DuplicateContentOptions {
  documentTypes: string[];
  severity: LintSeverity;
  fields: string[];
}

function getNestedValue(obj: any, path: string): string | undefined {
  const parts = path.split(".");
  let current = obj;
  for (const part of parts) {
    if (current == null) return undefined;
    current = current[part];
  }
  return typeof current === "string" ? current : undefined;
}

export function checkDuplicateContent(
  documents: DuplicateContentDocument[],
  options: DuplicateContentOptions
): LintIssue[] {
  const issues: LintIssue[] = [];
  const targetDocs = documents.filter((d) => options.documentTypes.includes(d._type));

  for (const field of options.fields) {
    const valueMap = new Map<string, DuplicateContentDocument[]>();

    for (const doc of targetDocs) {
      const val = getNestedValue(doc, field);
      if (!val) continue;

      const normalizedVal = val.trim().toLowerCase();
      if (!normalizedVal) continue;

      if (!valueMap.has(normalizedVal)) {
        valueMap.set(normalizedVal, []);
      }
      valueMap.get(normalizedVal)!.push(doc);
    }

    for (const [val, docsWithVal] of valueMap.entries()) {
      if (docsWithVal.length > 1) {
        for (const doc of docsWithVal) {
          const otherDocs = docsWithVal.filter((d) => d._id !== doc._id);
          const otherIds = otherDocs.map((d) => d._id).join(", ");
          
          const fieldName = field === 'slug.current' ? 'slug' : field;

          issues.push({
            ruleId: "C006",
            severity: options.severity,
            category: "content",
            message: `Document "${doc.title ?? doc._id}" has a duplicate ${fieldName} matching document(s): ${otherIds}.`,
            documentId: doc._id,
            documentType: doc._type,
            ...(doc.title ? { documentTitle: doc.title } : {}),
          });
        }
      }
    }
  }

  return issues;
}
