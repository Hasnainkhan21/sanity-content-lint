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
import { DOCUMENTS_QUERY } from "./sanity/queries.js";
import { checkMissingTitle } from "./rules/content/missingTitle.js";
import { checkMissingSeoDescription } from "./rules/content/missingSeoDescription.js";
import { checkMissingSlug } from "./rules/content/missingSlug.js";
import { checkMissingMainImage } from "./rules/content/missingMainImage.js";
import { checkBrokenReferences } from "./rules/content/brokenReferences.js";
import { checkDuplicateContent } from "./rules/content/duplicateContent.js";
import { checkMissingRequiredFields } from "./rules/content/missingRequiredFields.js";
import type { LintIssue } from "./rules/types.js";
import { loadConfig } from "./configLoader.js";
import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

function printHelp() {
  console.log(`
Usage: sanity-content-lint [options]

Options:
  -h, --help       Display this help message
  -v, --version    Display the package version
  --format <fmt>   Set output format: 'human' (default) or 'json'
  --no-color       Disable colored output

Examples:
  sanity-content-lint
  sanity-content-lint --format json
  sanity-content-lint --no-color
`.trim());
}

function printVersion() {
  try {
    const pkgPath = path.join(__dirname, "../package.json");
    const pkg = JSON.parse(fs.readFileSync(pkgPath, "utf-8"));
    console.log(pkg.version);
  } catch (e) {
    console.log("unknown");
  }
}

function colorize(text: string, colorCode: string, noColor: boolean) {
  if (noColor) return text;
  return `\x1b[${colorCode}m${text}\x1b[0m`;
}

async function main() {
  const args = process.argv.slice(2);
  let format = "human";
  let noColor = false;

  for (let i = 0; i < args.length; i++) {
    if (args[i] === "--help" || args[i] === "-h") {
      printHelp();
      return;
    }
    if (args[i] === "--version" || args[i] === "-v") {
      printVersion();
      return;
    }
    if (args[i] === "--no-color") {
      noColor = true;
    }
    if (args[i] === "--format=json") {
      format = "json";
    } else if (args[i] === "--format=human") {
      format = "human";
    } else if (args[i] === "--format") {
      format = args[i + 1] === "json" ? "json" : "human";
      i++;
    }
  }

  if (format === "human") {
    console.log(colorize("\nSanity Content Lint", "1", noColor)); // Bold
    console.log("-------------------");
    console.log("Analyzing content...\n");
  }

  try {
    const config = loadConfig();
    const { client } = await import("./sanity/client.js");
    const documents = await client.fetch(DOCUMENTS_QUERY);

    // ── Run all rules ────────────────────────────────────────────────────────
    // Each rule returns an array of LintIssue objects.
    // We merge them all into a single flat list so we can report them together.
    const issues: LintIssue[] = [
      ...(config.rules.missingTitle !== false ? checkMissingTitle(documents, config.rules.missingTitle) : []),
      ...(config.rules.missingSeoDescription !== false ? checkMissingSeoDescription(documents, config.rules.missingSeoDescription) : []),
      ...(config.rules.missingSlug !== false ? checkMissingSlug(documents, config.rules.missingSlug) : []),
      ...(config.rules.missingMainImage !== false ? checkMissingMainImage(documents, config.rules.missingMainImage) : []),
      ...(config.rules.brokenReferences !== false ? checkBrokenReferences(documents, config.rules.brokenReferences) : []),
      ...(config.rules.duplicateContent !== false ? checkDuplicateContent(documents, config.rules.duplicateContent) : []),
      ...(config.rules.missingRequiredFields !== false ? checkMissingRequiredFields(documents, config.rules.missingRequiredFields) : []),
    ];

    if (format === "json") {
      console.log(JSON.stringify({
        documentsAnalyzed: documents.length,
        totalIssues: issues.length,
        issues: issues
      }, null, 2));
    } else {
      // ── Summary ──────────────────────────────────────────────────────────────
      console.log(`Documents analyzed : ${documents.length}`);
      console.log(`Total issues found : ${issues.length}\n`);

      // ── Per-issue output ─────────────────────────────────────────────────────
      if (issues.length === 0) {
        console.log(colorize("✓ No issues found. Your content looks great!", "32", noColor));
      } else {
        for (const issue of issues) {
          // Print severity in upper case so it stands out (WARNING / ERROR).
          const label = issue.severity.toUpperCase();
          const coloredLabel = issue.severity === "error" 
            ? colorize(label, "31", noColor) // Red
            : colorize(label, "33", noColor); // Yellow
            
          console.log(`${coloredLabel} ${issue.ruleId}: ${issue.message}`);
          console.log(`  ID   : ${issue.documentId}`);
          console.log(`  Type : ${issue.documentType}\n`);
        }
      }
    }

    // Exit code 1 if there is at least one error
    const hasErrors = issues.some((i) => i.severity === "error");
    if (hasErrors) {
      process.exitCode = 1;
    }
  } catch (error) {
    if (format === "json") {
      console.log(JSON.stringify({
        error: error instanceof Error ? error.message : "Unknown error"
      }, null, 2));
    } else {
      console.error("Analysis failed.");
      if (error instanceof Error) {
        console.error(error.message);
      }
    }
    process.exitCode = 1;
  }
}

main();