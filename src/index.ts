#!/usr/bin/env node

import "dotenv/config";
import { client } from "./sanity/client.js";
import { DOCUMENT_COUNT_QUERY } from "./sanity/queries.js";

async function main() {
  console.log("\nSanity Content Lint");
  console.log("-------------------");
  console.log("Connecting to Sanity...\n");

  try {
    const documentCount = await client.fetch<number>(
      DOCUMENT_COUNT_QUERY
    );

    console.log("Connection successful!");
    console.log(`Project ID: ${process.env.SANITY_PROJECT_ID}`);
    console.log(`Dataset: ${process.env.SANITY_DATASET}`);
    console.log(`Documents found: ${documentCount}`);
  } catch (error) {
    console.error("Could not query Sanity.");

    if (error instanceof Error) {
      console.error(error.message);
    }

    process.exitCode = 1;
  }
}

main();