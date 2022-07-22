/* eslint-disable unicorn/prevent-abbreviations */

import rule from "./injectableShouldBeProvided";
import {ESLintUtils} from "@typescript-eslint/utils";
import path from "path";
//import {getFixturesRootDirectory} from "../../testing/fixtureSetup";

//const tsRootDirectory = getFixturesRootDirectory();
const ruleTester = new ESLintUtils.RuleTester({
    parser: "@typescript-eslint/parser",
    parserOptions: {
        project: ["tsconfig.test.json"],
        sourceType: "module",
        ecmaVersion: 2021,
        // eslint-disable-next-line unicorn/prefer-module
        tsconfigRootDir: path.join(__dirname, "../../../"),
    },
});

ruleTester.run("injectable-should-be-provided", rule, {
    valid: [
        {
            //no param name provided - can't check anything
            code: `
            import { registerAs} from "@nestjs/config";
            export default registerAs("email", () => ({
                isEmailSyncSendEnabled: process.env.EMAIL_SYNC_SEND_ENABLED,
                emailBcc: process.env.EMAIL_BCC,
                emailPassword: process.env.EMAIL_PASSWORD,
                emailUsername: process.env.EMAIL_USERNAME,
                senderEmailAddress: process.env.EMAIL_SENDER_ADDRESS,
                senderName: process.env.EMAIL_SENDER_NAME,
            }));
            `,
        },
    ],
    invalid: [],
});
