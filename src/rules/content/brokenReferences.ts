/**
 * Rule C005 – Broken References
 *
 * Detects references in documents that point to documents that do not exist.
 */

import type { LintSeverity, LintIssue } from "../types.js";

export interface BrokenReferencesDocument {
  _id: string;
  _type: string;
  title?: string;
  [key: string]: any;
}

export interface BrokenReferencesOptions {
  documentTypes: string[];
  severity: LintSeverity;
}

export function checkBrokenReferences(
  documents: BrokenReferencesDocument[],
  options: BrokenReferencesOptions
): LintIssue[] {
  const issues: LintIssue[] = [];
  const validIds = new Set(documents.map((d) => d._id));

  function findBrokenRefs(obj: any, path: string, doc: BrokenReferencesDocument) {
    if (!obj || typeof obj !== "object") return;

    // Is it a standard Sanity reference?
    if (obj._type === "reference" && typeof obj._ref === "string") {
      // Ignore valid image/file assets, they are separate from normal documents
      const isAsset = obj._ref.startsWith("image-") || obj._ref.startsWith("file-");
      
      if (!isAsset && !validIds.has(obj._ref)) {
        issues.push({
          ruleId: "C005",
          severity: options.severity,
          category: "content",
          message: `Document "${doc.title ?? doc._id}" contains a broken reference to "${obj._ref}" at path "${path}".`,
          documentId: doc._id,
          documentType: doc._type,
          ...(doc.title ? { documentTitle: doc.title } : {}),
        });
      }
      // Stop traversing this reference object further
      return;
    }

    if (Array.isArray(obj)) {
      for (let i = 0; i < obj.length; i++) {
        findBrokenRefs(obj[i], `${path}[${i}]`, doc);
      }
      return;
    }

    for (const [key, value] of Object.entries(obj)) {
      if (typeof value === "object") {
        findBrokenRefs(value, path ? `${path}.${key}` : key, doc);
      }
    }
  }

  for (const doc of documents) {
    if (!options.documentTypes.includes(doc._type)) {
      continue;
    }

    for (const [key, value] of Object.entries(doc)) {
      // Skip top-level system fields like _id, _type, _rev, _createdAt
      if (key.startsWith("_")) continue;
      findBrokenRefs(value, key, doc);
    }
  }

  return issues;
}
