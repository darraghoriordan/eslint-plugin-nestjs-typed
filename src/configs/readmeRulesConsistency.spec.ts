import {describe, it, expect} from "vitest";
import {readFileSync, readdirSync} from "fs";
import {resolve, dirname} from "path";
import {fileURLToPath} from "url";
import allRules from "../rules/index.js";
import {rules as recommendedRules} from "./recommended.js";

/* eslint-disable @typescript-eslint/naming-convention */
const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);
/* eslint-enable @typescript-eslint/naming-convention */
const repoRoot = resolve(__dirname, "../..");

describe("README rules table consistency", () => {
    it("should have all registered rules documented in src/docs/rules", () => {
        const documentationPath = resolve(repoRoot, "src/docs/rules");
        const documentFiles = readdirSync(documentationPath)
            .filter((file) => file.endsWith(".md"))
            .map((file) => file.replace(".md", ""));

        const registeredRules = Object.keys(allRules);

        // Check all registered rules have docs
        const missingDocumentation = registeredRules.filter(
            (rule) => !documentFiles.includes(rule)
        );
        expect(
            missingDocumentation,
            `The following rules are missing documentation files in src/docs/rules: ${missingDocumentation.join(", ")}`
        ).toHaveLength(0);

        // Check all doc files have registered rules
        const extraDocumentation = documentFiles.filter(
            (document) => !registeredRules.includes(document)
        );
        expect(
            extraDocumentation,
            `The following doc files exist but are not registered in src/rules/index.ts: ${extraDocumentation.join(", ")}`
        ).toHaveLength(0);
    });

    it("should have all registered rules in the recommended config", () => {
        const registeredRules = Object.keys(allRules);
        const configuredRules = Object.keys(recommendedRules).map((rule) =>
            rule.replace("@darraghor/nestjs-typed/", "")
        );

        const missingFromConfig = registeredRules.filter(
            (rule) => !configuredRules.includes(rule)
        );
        expect(
            missingFromConfig,
            `The following rules are missing from the recommended config: ${missingFromConfig.join(", ")}`
        ).toHaveLength(0);
    });

    it("should have all registered rules in the README table", () => {
        const readmePath = resolve(repoRoot, "README.md");
        const readmeContent = readFileSync(readmePath, "utf8");

        // Extract rule links from README table
        const readmeRuleMatches = Array.from(
            readmeContent.matchAll(/\[`([^`]+)`\]/g)
        );
        const readmeRules = Array.from(
            new Set(readmeRuleMatches.map((match) => match[1]))
        );

        const registeredRules = Object.keys(allRules);

        // Check all registered rules are in README
        const missingFromReadme = registeredRules.filter(
            (rule) => !readmeRules.includes(rule)
        );
        expect(
            missingFromReadme,
            `The following rules are missing from the README table: ${missingFromReadme.join(", ")}`
        ).toHaveLength(0);

        // Check no extra rules in README
        const extraInReadme = readmeRules.filter(
            (rule) => !registeredRules.includes(rule)
        );
        expect(
            extraInReadme,
            `The following rules are in README but not registered: ${extraInReadme.join(", ")}`
        ).toHaveLength(0);
    });

    it("should correctly show recommended status in README table", () => {
        const readmePath = resolve(repoRoot, "README.md");
        const readmeContent = readFileSync(readmePath, "utf8");

        // Get recommended status from config
        const recommendedStatus = new Map<string, boolean>();
        Object.entries(recommendedRules).forEach(([key, value]) => {
            const ruleName = key.replace("@darraghor/nestjs-typed/", "");
            // Handle both "error" and ["error", {...}] formats
            const isEnabled = Array.isArray(value)
                ? value[0] === "error"
                : value === "error";
            recommendedStatus.set(ruleName, isEnabled);
        });

        // Extract the table section
        const tableSectionRegex =
            /## Index of available rules\s+([\s\S]*?)(?=\n##|\n\n\*\*|$)/;
        const tableSection = tableSectionRegex.exec(readmeContent);
        expect(
            tableSection,
            "Could not find 'Index of available rules' section in README"
        ).not.toBeNull();

        if (tableSection) {
            const tableLines = tableSection[1]
                .split("\n")
                .filter((line) => line.includes("`"));

            const errors: string[] = [];

            recommendedStatus.forEach((isEnabled, ruleName) => {
                const lineMatch = tableLines.find((line) =>
                    line.includes(`\`${ruleName}\``)
                );
                if (lineMatch) {
                    const hasCheckmark = lineMatch.includes("✅");
                    const hasCross = lineMatch.includes("❌");

                    if (isEnabled && !hasCheckmark) {
                        errors.push(
                            `Rule '${ruleName}' is enabled in recommended config but README shows ❌`
                        );
                    } else if (!isEnabled && !hasCross) {
                        errors.push(
                            `Rule '${ruleName}' is disabled in recommended config but README shows ✅`
                        );
                    }
                } else {
                    errors.push(`Rule '${ruleName}' not found in README table`);
                }
            });

            expect(errors, errors.join("\n")).toHaveLength(0);
        }
    });

    it("should have consistent rule count across all sources", () => {
        const registeredRuleCount = Object.keys(allRules).length;
        const documentationPath = resolve(repoRoot, "src/docs/rules");
        const documentFileCount = readdirSync(documentationPath).filter(
            (file) => file.endsWith(".md")
        ).length;
        const recommendedRuleCount = Object.keys(recommendedRules).length;

        const readmePath = resolve(repoRoot, "README.md");
        const readmeContent = readFileSync(readmePath, "utf8");
        const readmeRuleMatches = Array.from(
            readmeContent.matchAll(/\[`([^`]+)`\]/g)
        );
        const readmeRuleCount = new Set(
            readmeRuleMatches.map((match) => match[1])
        ).size;

        expect(registeredRuleCount, "Registered rules count").toBe(
            documentFileCount
        );
        expect(registeredRuleCount, "Registered rules count").toBe(
            readmeRuleCount
        );
        expect(registeredRuleCount, "Registered rules count").toBe(
            recommendedRuleCount
        );
    });
});
