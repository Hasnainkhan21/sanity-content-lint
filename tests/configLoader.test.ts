import fs from "fs";
import path from "path";
import { describe, expect, it, afterEach } from "vitest";
import { loadConfig } from "../src/configLoader.js";
import { config as defaultConfig } from "../src/config.js";

const TEST_DIR = path.join(__dirname, "temp-config-test");

describe("configLoader", () => {
  afterEach(() => {
    if (fs.existsSync(TEST_DIR)) {
      const configPath = path.join(TEST_DIR, "sanity-content-lint.config.json");
      if (fs.existsSync(configPath)) {
        fs.unlinkSync(configPath);
      }
      fs.rmdirSync(TEST_DIR);
    }
  });

  function setupConfig(content: string) {
    if (!fs.existsSync(TEST_DIR)) {
      fs.mkdirSync(TEST_DIR);
    }
    fs.writeFileSync(path.join(TEST_DIR, "sanity-content-lint.config.json"), content);
  }

  it("loads default config when no file exists", () => {
    const config = loadConfig(TEST_DIR);
    expect(config).toEqual(JSON.parse(JSON.stringify(defaultConfig)));
  });

  it("merges custom config with defaults", () => {
    setupConfig(JSON.stringify({
      rules: {
        missingTitle: { severity: "error" },
        missingSlug: { documentTypes: ["page"] }
      }
    }));
    
    const config = loadConfig(TEST_DIR);
    expect(config.rules.missingTitle.severity).toBe("error");
    expect(config.rules.missingTitle.documentTypes).toEqual(["post", "article", "page"]); // from default
    expect(config.rules.missingSlug.documentTypes).toEqual(["page"]);
  });

  it("disables a rule when set to false", () => {
    setupConfig(JSON.stringify({
      rules: {
        missingTitle: false
      }
    }));
    
    const config = loadConfig(TEST_DIR);
    expect(config.rules.missingTitle).toBe(false);
  });

  it("throws error on invalid JSON", () => {
    setupConfig("{ invalid json ");
    expect(() => loadConfig(TEST_DIR)).toThrowError(/Failed to parse/);
  });

  it("throws error if rules is not an object", () => {
    setupConfig(JSON.stringify({ rules: ["an array"] }));
    expect(() => loadConfig(TEST_DIR)).toThrowError(/must be an object/);
  });

  it("throws error if rule config is invalid type", () => {
    setupConfig(JSON.stringify({ rules: { missingTitle: "invalid string" } }));
    expect(() => loadConfig(TEST_DIR)).toThrowError(/Expected an object or false/);
  });

  it("throws error on invalid severity", () => {
    setupConfig(JSON.stringify({ rules: { missingTitle: { severity: "fatal" } } }));
    expect(() => loadConfig(TEST_DIR)).toThrowError(/Expected "warning" or "error"/);
  });

  it("throws error on invalid documentTypes", () => {
    setupConfig(JSON.stringify({ rules: { missingTitle: { documentTypes: "post" } } }));
    expect(() => loadConfig(TEST_DIR)).toThrowError(/Expected an array of strings/);
  });
});
