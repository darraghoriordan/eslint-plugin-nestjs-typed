import {RuleTester} from "@typescript-eslint/rule-tester";
import {getFixturesRootDirectory} from "../../testing/fixtureSetup.js";
import rule from "./useDependencyInjection.js";

const tsRootDirectory = getFixturesRootDirectory();
const ruleTester = new RuleTester({
    languageOptions: {
        parserOptions: {
            ecmaVersion: 2015,
            tsconfigRootDir: tsRootDirectory,
            project: "./tsconfig.json",
        },
    },
});

ruleTester.run("use-dependency-injection", rule, {
    valid: [
        {
            name: "Injectable with constructor DI (shorthand)",
            code: `
                @Injectable()
                export class CatService {
                    constructor(private logger: Logger) {}
                }
            `,
        },
        {
            name: "Injectable with constructor DI (full form)",
            code: `
                @Injectable()
                export class CatService {
                    private logger: Logger;
                    constructor(logger: Logger) {
                        this.logger = logger;
                    }
                }
            `,
        },
        {
            name: "Controller with constructor DI",
            code: `
                @Controller()
                export class CatController {
                    constructor(
                        private catService: CatService,
                        private logger: Logger
                    ) {}
                }
            `,
        },
        {
            name: "Injectable with uninitialized property",
            code: `
                @Injectable()
                export class CatService {
                    private logger: Logger;
                }
            `,
        },
        {
            name: "Injectable with primitive constant",
            code: `
                @Injectable()
                export class CatService {
                    private readonly maxRetries = 3;
                    private name = 'CatService';
                }
            `,
        },
        {
            name: "Non-injectable class with new expression",
            code: `
                export class UtilityClass {
                    private logger = new Logger();
                }
            `,
        },
        {
            name: "Injectable with property from constructor param",
            code: `
                @Injectable()
                export class CatService {
                    private config: Config;
                    constructor(config: Config) {
                        this.config = config;
                    }
                }
            `,
        },
        {
            name: "Component decorator (legacy)",
            code: `
                @Component()
                export class CatService {
                    constructor(private logger: Logger) {}
                }
            `,
        },
        {
            name: "Injectable with array literal",
            code: `
                @Injectable()
                export class CatService {
                    private items = [];
                }
            `,
        },
        {
            name: "Injectable with object literal",
            code: `
                @Injectable()
                export class CatService {
                    private config = { debug: true };
                }
            `,
        },
    ],
    invalid: [
        {
            name: "Injectable with new expression in property",
            code: `
                @Injectable()
                export class CatService {
                    private logger = new Logger();
                }
            `,
            errors: [
                {
                    messageId: "useDependencyInjection",
                },
            ],
        },
        {
            name: "Injectable with new expression in constructor",
            code: `
                @Injectable()
                export class CatService {
                    logger: Logger;
                    constructor() {
                        this.logger = new Logger();
                    }
                }
            `,
            errors: [
                {
                    messageId: "useDependencyInjection",
                },
            ],
        },
        {
            name: "Injectable with require call in property",
            code: `
                @Injectable()
                export class CatService {
                    private logger = require('bunyan');
                }
            `,
            errors: [
                {
                    messageId: "useDependencyInjection",
                },
            ],
        },
        {
            name: "Injectable with imported variable in property",
            code: `
                import bunyan from 'bunyan';
                
                @Injectable()
                export class CatService {
                    private logger = bunyan;
                }
            `,
            errors: [
                {
                    messageId: "useDependencyInjection",
                },
            ],
        },
        {
            name: "Injectable with top-level require variable in property",
            code: `
                const bunyan = require('bunyan');
                
                @Injectable()
                export class CatService {
                    private logger = bunyan;
                }
            `,
            errors: [
                {
                    messageId: "useDependencyInjection",
                },
            ],
        },
        {
            name: "Controller with new expression in property",
            code: `
                @Controller()
                export class CatController {
                    private service = new CatService();
                }
            `,
            errors: [
                {
                    messageId: "useDependencyInjection",
                },
            ],
        },
        {
            name: "Multiple violations in single class",
            code: `
                @Injectable()
                export class CatService {
                    private logger = new Logger();
                    private config = new Config();
                }
            `,
            errors: [
                {
                    messageId: "useDependencyInjection",
                },
                {
                    messageId: "useDependencyInjection",
                },
            ],
        },
        {
            name: "Injectable with require and new expression",
            code: `
                @Injectable()
                export class CatService {
                    private logger = require('bunyan');
                    private service = new OtherService();
                }
            `,
            errors: [
                {
                    messageId: "useDependencyInjection",
                },
                {
                    messageId: "useDependencyInjection",
                },
            ],
        },
        {
            name: "Service decorator with new expression",
            code: `
                @Service()
                export class CatService {
                    private logger = new Logger();
                }
            `,
            errors: [
                {
                    messageId: "useDependencyInjection",
                },
            ],
        },
    ],
});
