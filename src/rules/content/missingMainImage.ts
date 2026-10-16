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

/**
 * Checks whether an image value contains a valid Sanity image asset.
 * A valid Sanity image must be an object containing a non-empty asset reference.
 */
function hasValidImageAsset(value: any): boolean {
  if (!value || typeof value !== "object" || Array.isArray(value)) {
    return false;
  }

  // An empty object has no image data
  if (Object.keys(value).length === 0) {
    return false;
  }

  // Direct reference to an asset: { _ref: "image-..." }
  if (typeof value._ref === "string" && value._ref.trim().length > 0) {
    return true;
  }

  const asset = value.asset;
  if (!asset) {
    return false;
  }

  // Asset as string ID or reference
  if (typeof asset === "string") {
    return asset.trim().length > 0;
  }

  // Asset as reference object or dereferenced object
  if (typeof asset === "object" && !Array.isArray(asset)) {
    if (typeof asset._ref === "string") {
      return asset._ref.trim().length > 0;
    }
    if (typeof asset._id === "string") {
      return asset._id.trim().length > 0;
    }
    if (typeof asset.url === "string") {
      return asset.url.trim().length > 0;
    }
    return Object.keys(asset).length > 0 && asset._ref !== "";
  }

  return false;
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
    const isMissing = !hasValidImageAsset(value);

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
