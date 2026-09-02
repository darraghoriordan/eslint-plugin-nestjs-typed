import {RuleTester} from "@typescript-eslint/rule-tester";
import {getFixturesRootDirectory} from "../../testing/fixtureSetup.js";
import rule from "./forwardRefInjectionShouldUseWrapperType.js";

const ruleTester = new RuleTester({
    languageOptions: {
        parserOptions: {
            ecmaVersion: 2015,
            tsconfigRootDir: getFixturesRootDirectory(),
            project: "./tsconfig-esm-withMeta.json",
        },
    },
});

ruleTester.run("forward-ref-injection-should-use-wrapper-type", rule, {
    valid: [
        {
            code: `type WrapperType<T> = T;
                class UsersService {
                    constructor(
                        @Inject(forwardRef(() => ProfileService))
                        private readonly profileService: WrapperType<ProfileService>,
                    ) {}
                }`,
        },
        {
            code: `class UsersService {
                    constructor(private readonly profileService: ProfileService) {}
                }`,
        },
        {
            code: `class UsersService {
                    constructor(
                        @Inject(PROFILE_SERVICE)
                        private readonly profileService: ProfileService,
                    ) {}
                }`,
        },
        {
            languageOptions: {
                parserOptions: {
                    ecmaVersion: 2015,
                    tsconfigRootDir: getFixturesRootDirectory(),
                    project: "./tsconfig-withMeta.json",
                },
            },
            code: `class UsersService {
                    constructor(
                        @Inject(forwardRef(() => ProfileService))
                        private readonly profileService: ProfileService,
                    ) {}
                }`,
        },
        {
            code: `class UsersService {
                    constructor(
                        @Inject(forwardRef(() => ProfileService))
                        profileService: ProfileService | undefined,
                    ) {}
                }`,
        },
    ],
    invalid: [
        {
            code: `class UsersService {
                    constructor(
                        @Inject(forwardRef(() => ProfileService))
                        private readonly profileService: ProfileService,
                    ) {}
                }`,
            errors: [{messageId: "useWrapperType"}],
        },
        {
            code: `class UsersService {
                    constructor(
                        @Inject(forwardRef(() => ProfileService))
                        profileService: ProfileService,
                    ) {}
                }`,
            errors: [{messageId: "useWrapperType"}],
        },
    ],
});
