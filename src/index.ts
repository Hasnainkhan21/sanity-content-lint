#!/usr/bin/env node

/**
 * CLI entry point for sanity-content-lint.
 *
 * This script:
 *  1. Fetches all published documents from your Sanity project.
 *  2. Runs every configured lint rule against those documents.
 *  3. Prints a summary and the list of issues to the terminal.
 */

import "dotenv/config";
import { client } from "./sanity/client.js";
import { DOCUMENTS_QUERY } from "./sanity/queries.js";
import { config } from "./config.js";
import { checkMissingTitle } from "./rules/content/missingTitle.js";
import { checkMissingSeoDescription } from "./rules/content/missingSeoDescription.js";
import { checkMissingSlug } from "./rules/content/missingSlug.js";
import { checkMissingMainImage } from "./rules/content/missingMainImage.js";
import { checkBrokenReferences } from "./rules/content/brokenReferences.js";
import { checkDuplicateContent } from "./rules/content/duplicateContent.js";
import { checkMissingRequiredFields } from "./rules/content/missingRequiredFields.js";
import type { LintIssue } from "./rules/types.js";

async function main() {
  console.log("\nSanity Content Lint");
  console.log("-------------------");
  console.log("Analyzing content...\n");

  try {
    const documents = await client.fetch(DOCUMENTS_QUERY);

    // ── Run all rules ────────────────────────────────────────────────────────
    // Each rule returns an array of LintIssue objects.
    // We merge them all into a single flat list so we can report them together.
    const issues: LintIssue[] = [
      ...checkMissingTitle(documents, config.rules.missingTitle),
      ...checkMissingSeoDescription(documents, config.rules.missingSeoDescription),
      ...checkMissingSlug(documents, config.rules.missingSlug),
      ...checkMissingMainImage(documents, config.rules.missingMainImage),
      ...checkBrokenReferences(documents, config.rules.brokenReferences),
      ...checkDuplicateContent(documents, config.rules.duplicateContent),
      ...checkMissingRequiredFields(documents, config.rules.missingRequiredFields),
    ];

    // ── Summary ──────────────────────────────────────────────────────────────
    console.log(`Documents analyzed : ${documents.length}`);
    console.log(`Total issues found : ${issues.length}\n`);

    // ── Per-issue output ─────────────────────────────────────────────────────
    if (issues.length === 0) {
      console.log("✓ No issues found. Your content looks great!");
    } else {
      for (const issue of issues) {
        // Print severity in upper case so it stands out (WARNING / ERROR).
        const label = issue.severity.toUpperCase();
        console.log(`${label} ${issue.ruleId}: ${issue.message}`);
        console.log(`  ID   : ${issue.documentId}`);
        console.log(`  Type : ${issue.documentType}\n`);
      }
    }
  } catch (error) {
    console.error("Analysis failed.");

    if (error instanceof Error) {
      console.error(error.message);
    }

    process.exitCode = 1;
  }
}

main();