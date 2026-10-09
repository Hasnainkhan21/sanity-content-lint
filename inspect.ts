import "dotenv/config";
import { client } from "./src/sanity/client.js";

async function run() {
  const docs = await client.fetch(`*[]{...}`);
  
  function findRefs(obj: any, path: string, docId: string) {
    if (!obj || typeof obj !== 'object') return;
    if (obj._ref) {
      console.log(`Doc ${docId} has ref at ${path}: ${obj._ref}`);
    }
    for (const key of Object.keys(obj)) {
      if (key !== '_ref' && typeof obj[key] === 'object') {
        findRefs(obj[key], path ? `${path}.${key}` : key, docId);
      }
    }
  }

  for (const doc of docs) {
    findRefs(doc, '', doc._id);
  }
}

run().catch(console.error);
