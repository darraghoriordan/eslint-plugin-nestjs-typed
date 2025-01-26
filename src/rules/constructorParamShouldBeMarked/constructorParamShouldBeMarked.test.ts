import rule from "./constructorParamShouldBeMarked";
import {RuleTester} from "@typescript-eslint/rule-tester";

import {getFixturesRootDirectory} from "../../testing/fixtureSetup";
import path from "path";

const ruleTester = new RuleTester({
    languageOptions: {
        parserOptions: {
            ecmaVersion: 2015,
            tsconfigRootDir: getFixturesRootDirectory(),
            project: "tsconfig-withMeta.json",
        },
    },
});

ruleTester.run("constructor-param-should-be-marked", rule, {
    valid: [
        {
            code: `
            import {Injectable} from "./Injectable.stub";

            interface FirstInterface {
                key: "value"
            }

            @Injectable()
            export class MainProvider {
                private num: number = 5

                constructor(
                    @Inject("INLINE_FIRST_TOKEN")
                    private readonly first: FirstInterface,
                    @Inject("INLINE_SECOND_TOKEN")
                    private readonly second: number
                ) {}
            }
            `,
            options: [
                {
                    src: [path.join(__dirname + "../../../fixtures", "*.ts")],
                    filterFromPaths: [
                        "node_modules",
                        ".test.",
                        ".spec.",
                        "file.ts",
                    ],
                },
            ],
        },
        {
            code: `
            import {Injectable} from "./Injectable.stub";

            @Injectable()
            export class FirstProvider {
                constructor() {}
            }

            @Injectable()
            export class MainProvider {
                constructor(
                    @Inject(FirstProvider)
                    private readonly first: FirstProvider
                ) {}
            }
            `,
            options: [
                {
                    src: [path.join(__dirname + "../../../fixtures", "*.ts")],
                    filterFromPaths: [
                        "node_modules",
                        ".test.",
                        ".spec.",
                        "file.ts",
                    ],
                },
            ],
        },
        {
            code: `
            import {Injectable} from "./Injectable.stub";

            const TOKEN = Symbol("token")

            interface FirstInterface {
                key: "value"
            }

            @Injectable()
            export class MainProvider {
                constructor(
                    @Inject(TOKEN)
                    private readonly first: FirstInterface
                ) {}
            }
            `,
            options: [
                {
                    src: [path.join(__dirname + "../../../fixtures", "*.ts")],
                    filterFromPaths: [
                        "node_modules",
                        ".test.",
                        ".spec.",
                        "file.ts",
                    ],
                },
            ],
        },
    ],
    invalid: [
        {
            code: `
            import {Injectable} from "./Injectable.stub";

            @Injectable()
            export class FirstProvider {
                constructor() {}
            }

            @Injectable()
            export class SomeProvider {
                constructor(
                    private readonly first: FirstProvider
                ) {}
            }
                `,
            errors: [{messageId: "injectInConstructor"}],
            options: [
                {
                    src: [path.join(__dirname + "../../../fixtures", "*.ts")],
                    filterFromPaths: [
                        "node_modules",
                        ".test.",
                        ".spec.",
                        "file.ts",
                    ],
                },
            ],
        },
        {
            code: `
            import {Injectable} from "./Injectable.stub";

            @Injectable()
            export class FirstProvider {
                constructor() {}
            }

            @Injectable()
            export class SecondProvider {
                constructor() {}
            }

            @Injectable()
            export class MainProvider {
                constructor(
                    private readonly first: FirstProvider,
                    @Inject(SecondProvider)
                    private readonly second: SecondProvider
                ) {}
            }
        `,
            errors: [{messageId: "injectInConstructor"}],
            options: [
                {
                    src: [path.join(__dirname + "../../../fixtures", "*.ts")],
                    filterFromPaths: [
                        "node_modules",
                        ".test.",
                        ".spec.",
                        "file.ts",
                    ],
                },
            ],
        },
    ],
});
