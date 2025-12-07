<!-- Copilot / AI agent guidance for contributors -->

# Repo guide for AI agents

Purpose: give a concise, actionable overview so an AI coding agent can be immediately productive in this repository.

High level

- **What this repo is**: an ESLint plugin for NestJS that ships both Classic and Flat configs. Core rule code lives under `src/rules/*`, docs for rules under `src/docs/rules/`, and example fixtures under `src/fixtures/`.
- **Module format**: ESM (`"type": "module"` in `package.json`). Builds to `dist/` with `tsc` (see `tsconfig.build.json`).

Key files to read first

- `README.md` — project purpose, recommended rules, and usage notes (swagger, injectables scanning).
- `package.json` — scripts (`build`, `lint`, `test`) and release tooling (`semantic-release`).
- `src/index.ts` — how the plugin exports both classic (`classicPlugin`) and flat configs (`configs.flatRecommended`).
- `src/rules/index.ts` — rule registration map; add rules here to expose them.
- `src/utils/createRule.ts` — helper used to create rules and generate docs links.
- `eslint.config.mjs` — repository lint rules and ignore patterns (useful when running local lint).

Workflows & commands

- Build: `npm run build` — cleans and runs `tsc --project tsconfig.build.json` (output to `dist/`).
- Lint: `npm run lint` — runs `npx eslint --no-error-on-unmatched-pattern` (note: flat configs are used in exports; watch parser/project settings in `eslint.config.mjs`).
- Test: `npm test` or `npm run test:watch` — uses `vitest` (`vitest run`).
- Precommit: `npm run pre-commit` triggers `lint-staged` via husky hooks.
- Release: semantic-release via `npm run release` (CI oriented).

Project-specific conventions

- Rules live in `src/rules/<ruleFolder>/` and export a default rule object. Register the rule key in `src/rules/index.ts` to surface it.
- Each rule should have a doc page at `src/docs/rules/<ruleName>.md`. `createRule` in `src/utils/createRule.ts` constructs the canonical docs URL.
- Tests and fixtures: tests use `src/fixtures/*` to simulate user projects. Some rules (notably the injectables scanner) scan broad paths — prefer filtering via config (`filterFromPaths`) in rule options or keeping fixtures small.
- Plugin exports: `src/index.ts` reads `package.json` at runtime (via `readFileSync`) to avoid copying `package.json` to `dist/`. Keep that in mind if changing build copying.

Adding a new rule — minimal checklist

1. Add implementation in `src/rules/<your-rule>/index.ts` (or a named file) and export default the rule.
2. Add a docs file `src/docs/rules/<your-rule>.md` describing rationale and examples.
3. Import and add to the map in `src/rules/index.ts` with the rule key string (kebab-case) matching docs filename.
4. Write tests using fixtures in `src/fixtures/` and add test files under `src/...` following existing patterns.
5. Run `npm run build` and `npm test` locally.

Testing and CI notes

- Tests run under `vitest`. Unit tests expect TypeScript compilation semantics — test config files include `tsconfig.test.json` and `tsconfig.lint.json` for parser/project settings.
- Some rules rely on TypeScript semantic information via `@typescript-eslint` utils — ensure `parserOptions.project` is configured when running lint/test locally.

Common pitfalls

- ESM and `tsc`: ensure imports use `.js` in compiled `dist` imports (this repo compiles with TS to ESM and references `.js` in `src` imports already).
- Large-scope scanning rules: the injectables rule may scan the repo — when adding tests, keep fixture scope narrow or use rule options to filter scanned paths.

Developer preferences & patterns

- Naming: rule names and docs use kebab-case (see `src/rules/index.ts`).
- Use `createRule` for consistent `meta.docs.url` link generation.
- Keep `dist/` in `files` published to npm; source is TS in `src/`.

Where to look for examples

- Adding a rule: `src/rules/noDuplicateDecorators/*` and its doc in `src/docs/rules/no-duplicate-decorators.md`.
- Complex rule using type info: `src/rules/providerInjectedShouldMatchFactory/ProviderInjectedShouldMatchFactory.js`.

If something is missing

- Ask for the intended test case or sample input and I will adapt the new rule or test fixture.

For PRs - use semantic commit messages and PR titles for changelog generation. e.g `feat: add new authorization guard for roles`. fix or chore or docs.
