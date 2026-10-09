import fs from "fs";
import path from "path";
import { config as defaultConfig } from "./config.js";

export interface SanityContentLintConfig {
  rules: Record<string, any>;
}

export function loadConfig(cwd: string = process.cwd()): SanityContentLintConfig {
  const configPath = path.join(cwd, "sanity-content-lint.config.json");
  
  // Start with a deep copy of default config
  const finalConfig: SanityContentLintConfig = JSON.parse(JSON.stringify(defaultConfig));

  if (!fs.existsSync(configPath)) {
    return finalConfig;
  }

  let userConfig: any;
  try {
    const fileContent = fs.readFileSync(configPath, "utf-8");
    userConfig = JSON.parse(fileContent);
  } catch (err: any) {
    throw new Error(`Failed to parse sanity-content-lint.config.json: ${err.message}`);
  }

  if (userConfig.rules && typeof userConfig.rules === "object" && !Array.isArray(userConfig.rules)) {
    for (const [ruleName, ruleConfig] of Object.entries(userConfig.rules)) {
      if (ruleConfig === false) {
        // Disable rule
        finalConfig.rules[ruleName] = false;
        continue;
      }
      
      if (!finalConfig.rules[ruleName]) {
        // Rule does not exist in defaults, just accept it
        finalConfig.rules[ruleName] = ruleConfig;
        continue;
      }

      if (typeof ruleConfig !== "object" || ruleConfig === null || Array.isArray(ruleConfig)) {
        throw new Error(`Invalid configuration for rule "${ruleName}": Expected an object or false.`);
      }

      // Merge rule config
      finalConfig.rules[ruleName] = {
        ...finalConfig.rules[ruleName],
        ...ruleConfig
      };

      // Validate severity
      const severity = finalConfig.rules[ruleName].severity;
      if (severity !== "warning" && severity !== "error") {
        throw new Error(`Invalid severity for rule "${ruleName}": Expected "warning" or "error", got "${severity}".`);
      }
      
      // Validate documentTypes if present
      const docTypes = finalConfig.rules[ruleName].documentTypes;
      if (docTypes !== undefined && !Array.isArray(docTypes)) {
        throw new Error(`Invalid documentTypes for rule "${ruleName}": Expected an array of strings.`);
      }
    }
  } else if (userConfig.rules !== undefined) {
    throw new Error(`Invalid configuration: "rules" must be an object.`);
  }

  return finalConfig;
}
