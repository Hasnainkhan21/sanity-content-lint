
/**
 * Shared types for all lint rules.
 * Centralised here so every rule imports from one place
 * instead of duplicating definitions.
 */

/** How serious a lint issue is. */
export type LintSeverity = "error" | "warning" | "info";

/**
 * A single lint issue produced by any rule.
 * Rules fill in the fields they know about.
 */
export interface LintIssue {
  /** Short rule identifier, e.g. "C001" or "C003". */
  ruleId: string;
  severity: LintSeverity;
  /** Broad category the rule belongs to, e.g. "content". */
  category: string;
  /** Human-readable description of the problem. */
  message: string;
  documentId?: string;
  documentType?: string;
  documentTitle?: string;
}
