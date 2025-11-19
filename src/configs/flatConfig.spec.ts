import {describe, it, expect} from "vitest";
import plugin from "../index.js";
import type {Linter} from "eslint";

describe("flat config", () => {
    it("should be assignable to Linter.Config[]", () => {
        const config: Linter.Config[] = [...plugin.configs.flatRecommended];
        expect(config).toBeDefined();
        expect(config.length).toBeGreaterThan(0);
    });

    it("should have the correct structure", () => {
        const config = plugin.configs.flatRecommended;
        // check for some expected properties
        const baseConfig = config.find(
            (c) => c.name === "@darraghor/nestjs-typed/base"
        );
        expect(baseConfig).toBeDefined();
        expect(baseConfig?.plugins?.["@darraghor/nestjs-typed"]).toBeDefined();

        const recommendedConfig = config.find(
            (c) => c.name === "@darraghor/nestjs-typed/recommended"
        );
        expect(recommendedConfig).toBeDefined();
        expect(recommendedConfig?.rules).toBeDefined();
    });
});
