
export interface MissingSlugDocument {
  _id: string;
  _type: string;
  title?: string;
  slug?: {
    current?: string;
  };
}

export interface MissingSlugOptions {
  documentTypes: string[];
  severity: LintSeverity;
}

export type LintSeverity = "error" | "warning" | "info";

export interface LintIssue {
  ruleId: string;
  severity: LintSeverity;
  category: string;
  message: string;
  documentId?: string;
  documentType?: string;
  documentTitle?: string;
}

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