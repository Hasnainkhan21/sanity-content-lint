import { describe, expect, it } from "vitest";
import { execSync } from "child_process";
import path from "path";

describe("CLI Interface", () => {
  const cliPath = path.join(__dirname, "../dist/index.js");

  it("outputs valid JSON with --format json", () => {
    let output = "";
    try {
      output = execSync(`node ${cliPath} --format json`, { encoding: "utf8" });
    } catch (err: any) {
      output = err.stdout;
    }

    let parsed: any;
    try {
      parsed = JSON.parse(output);
    } catch (e) {
      throw new Error(`CLI output is not valid JSON:\n${output}`);
    }

    if (parsed.error) {
      expect(typeof parsed.error).toBe("string");
    } else {
      expect(typeof parsed.documentsAnalyzed).toBe("number");
      expect(typeof parsed.totalIssues).toBe("number");
      expect(Array.isArray(parsed.issues)).toBe(true);
    }
  });

  it("outputs help text with --help", () => {
    const output = execSync(`node ${cliPath} --help`, { encoding: "utf8" });
    expect(output).toContain("Usage: sanity-content-lint");
    expect(output).toContain("--format");
    expect(output).toContain("--no-color");
  });

  it("outputs version with --version", () => {
    const output = execSync(`node ${cliPath} --version`, { encoding: "utf8" });
    // Assuming version is something like 0.1.0, just check it has dots and numbers
    expect(output.trim()).toMatch(/^[0-9]+\.[0-9]+\.[0-9]+$/);
  });

  it("outputs human readable format by default", () => {
    let output = "";
    try {
      output = execSync(`node ${cliPath}`, { encoding: "utf8" });
    } catch (err: any) {
      output = err.stdout;
    }
    expect(output).toContain("Sanity Content Lint");
    expect(output).toContain("Documents analyzed");
  });
  
  it("outputs plain text with --no-color", () => {
    let output = "";
    try {
      output = execSync(`node ${cliPath} --no-color`, { encoding: "utf8" });
    } catch (err: any) {
      output = err.stdout;
    }
    // Should not contain ANSI escape codes
    expect(output).not.toContain("\x1b[");
  });
});
