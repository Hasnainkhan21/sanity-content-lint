#!/usr/bin/env node

import "dotenv/config";
import { client } from "./sanity/client.js";
import { DOCUMENTS_QUERY } from "./sanity/queries.js";
import { config } from "./config.js";
import { checkMissingSlug } from "./rules/content/missingSlug.js";

async function main() {
  console.log("\nSanity Content Lint");
  console.log("-------------------");
  console.log("Analyzing content...\n");

  try {
    const documents = await client.fetch(DOCUMENTS_QUERY);

    const issues = checkMissingSlug(
      documents,
      config.rules.missingSlug
    );

    console.log(`Documents analyzed: ${documents.length}`);
    console.log(`Missing slug issues: ${issues.length}\n`);

    for (const issue of issues) {
      console.log(`WARNING ${issue.ruleId}: ${issue.message}`);
      console.log(`  ID: ${issue.documentId}`);
      console.log(`  Type: ${issue.documentType}\n`);
    }

    if (issues.length === 0) {
      console.log("No missing slug issues found.");
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