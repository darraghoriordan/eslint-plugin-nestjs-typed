<!-- Copilot / AI agent guidance for contributors -->

# Repo guide for AI agents

Purpose: give a concise, actionable overview so an AI coding agent can be immediately productive in this repository.

High level

- **What this repo is**: an ESLint plugin for NestJS that ships both Classic and Flat configs. Core rule code lives under `src/rules/*`, docs for rules under `src/docs/rules/`, and example fixtures under `src/fixtures/`.
- **Module format**: ESM (`"type": "module"` in `package.json`). Builds to `dist/` with `tsc` (see `tsconfig.build.json`).
- Use pnpm for package management (see `pnpm-lock.yaml`). `pnpm install` to set up.
- Use semantic commit messages for changelog generation. commits and PR titles should follow conventional commit format (feat, fix, chore, docs, etc)

Key files to read first

- `README.md` — project purpose, recommended rules, and usage notes (swagger, injectables scanning).
- `package.json` — scripts (`build`, `lint`, `test`) and release tooling (`semantic-release`).
- `src/index.ts` — how the plugin exports both classic (`classicPlugin`) and flat configs (`configs.flatRecommended`).
- `src/rules/index.ts` — rule registration map; add rules here to expose them.
- `src/utils/createRule.ts` — helper used to create rules and generate docs links.
- `eslint.config.mjs` — repository lint rules and ignore patterns (useful when running local lint).

Workflows & commands

- Build: `pnpm run build` — cleans and runs `tsc --project tsconfig.build.json` (output to `dist/`).
- Lint: `pnpm run lint` — runs `npx eslint --no-error-on-unmatched-pattern` (note: flat configs are used in exports; watch parser/project settings in `eslint.config.mjs`).
- Test: `pnpm run test` or `npm run test:watch` — uses `vitest` (`vitest run`).
- Precommit: `pnpm run pre-commit` triggers `lint-staged` via husky hooks.
- Release: semantic-release via `pnpm run release` (CI oriented).

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
5. Run `pnpm run build` and `pnpm test` locally.

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

Security considerations

- **Type safety**: Maintain strict TypeScript configuration. Don't use `any` types unless absolutely necessary and well-documented.
- **Input validation**: When working with user-facing rules or configurations, ensure proper validation and sanitization.
- **ESLint rule security**: Be cautious about rules that perform file system operations or execute code. Follow the patterns in existing rules like `injectablesShouldBeProvided`.
- **Avoid shell injection**: When using `glob` or file operations, validate paths and never concatenate user input directly into file paths.

Troubleshooting and common issues

- **TypeScript compilation errors**: If you see "cannot find module" errors, ensure `pnpm install` has been run and check `tsconfig.*.json` files for correct path mappings.
- **Test failures with type checking**: Some tests require `parserOptions.project` to be set correctly. Check `tsconfig.test.json` for the right configuration.
- **ESM import issues**: Remember this is an ESM project. Import statements in compiled code should use `.js` extensions even when source uses `.ts`.
- **Fixture scanning issues**: If the `injectablesShouldBeProvided` rule is scanning too many files, use `filterFromPaths` option in the rule configuration or keep test fixtures minimal.
- **Build output missing**: Ensure `dist/` directory is created and `tsc` completes successfully. The `build` script cleans and recreates this directory.
- **Lint errors**: If lint complains about parser configuration, check `eslint.config.mjs` for `parserOptions.project` and ensure it points to the right tsconfig files.

Contribution workflow

1. **Fork and clone**: Fork the repository and clone your fork locally.
2. **Install dependencies**: Run `pnpm install` to install all dependencies.
3. **Create a branch**: Use a descriptive branch name like `feat/new-rule-name` or `fix/rule-bug`.
4. **Make changes**: Follow the conventions outlined above. Keep changes focused and minimal.
5. **Test locally**: Run `pnpm run build`, `pnpm run lint`, and `pnpm run test` before committing.
6. **Commit with semantic messages**: Use conventional commit format (feat, fix, chore, docs, etc.).
7. **Push and create PR**: Push to your fork and create a pull request with a clear title and description.
8. **Respond to feedback**: Address review comments and update your PR as needed.

Testing guidelines

- **Test structure**: Tests are written using `vitest` and `@typescript-eslint/rule-tester`.
- **Fixtures**: Use fixtures in `src/fixtures/` for complex test scenarios. Keep fixtures minimal and focused.
- **Rule tests**: Each rule should have a corresponding `.test.ts` file testing both valid and invalid cases.
- **Coverage expectations**: Aim for comprehensive coverage of rule logic, including edge cases and error conditions.
- **Running specific tests**: Use `pnpm test -- path/to/test.ts` to run a specific test file during development.
- **Watch mode**: Use `pnpm run test:watch` for continuous testing during development.
- **Type-aware rules**: When testing rules that use TypeScript type information, ensure test files have proper `parserOptions.project` configuration.
