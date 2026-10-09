
import { createClient } from "@sanity/client";

const projectId = process.env.SANITY_PROJECT_ID;
const dataset = process.env.SANITY_DATASET;
const apiVersion = process.env.SANITY_API_VERSION;

if (!projectId || !dataset || !apiVersion) {
  throw new Error(
    "Missing Sanity configuration. Check your .env file."
  );
}

export const client = createClient({
  projectId,
  dataset,
  apiVersion,
  useCdn: false,
  ...(process.env.SANITY_TOKEN
    ? { token: process.env.SANITY_TOKEN }
    : {}),
});