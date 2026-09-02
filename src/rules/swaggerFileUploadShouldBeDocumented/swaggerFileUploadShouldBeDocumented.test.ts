import {RuleTester} from "@typescript-eslint/rule-tester";
import {getFixturesRootDirectory} from "../../testing/fixtureSetup.js";
import rule, {
    type SwaggerFileUploadShouldBeDocumentedOptions,
} from "./swaggerFileUploadShouldBeDocumented.js";

const ruleTester = new RuleTester({
    languageOptions: {
        parserOptions: {
            ecmaVersion: 2015,
            tsconfigRootDir: getFixturesRootDirectory(),
            project: "./tsconfig.json",
        },
    },
});

ruleTester.run("swagger-file-upload-should-be-documented", rule, {
    valid: [
        {
            code: `class FilesController {
                @Post()
                @ApiConsumes("multipart/form-data")
                @ApiBody({ type: FileUploadDto })
                upload(@UploadedFile() file: Express.Multer.File) {}
            }`,
        },
        {
            code: `@ApiConsumes("multipart/form-data")
            class FilesController {
                @Post()
                @ApiBody({ type: FilesUploadDto })
                upload(@UploadedFiles() files: Express.Multer.File[]) {}
            }`,
        },
        {
            options: [
                {additionalSwaggerDecorators: ["ApiMultipart"]},
            ] satisfies SwaggerFileUploadShouldBeDocumentedOptions,
            code: `class FilesController {
                @Post()
                @ApiMultipart()
                upload(@UploadedFile() file: Express.Multer.File) {}
            }`,
        },
        {
            code: `@ApiExcludeController()
            class FilesController {
                @Post()
                upload(@UploadedFile() file: Express.Multer.File) {}
            }`,
        },
        {
            code: `class FilesController {
                @Post()
                @ApiExcludeEndpoint()
                upload(@UploadedFile() file: Express.Multer.File) {}
            }`,
        },
        {
            code: `class FilesController {
                upload(@UploadedFile() file: Express.Multer.File) {}
            }`,
        },
    ],
    invalid: [
        {
            code: `class FilesController {
                @Post()
                upload(@UploadedFile() file: Express.Multer.File) {}
            }`,
            errors: [
                {messageId: "missingApiConsumes"},
                {messageId: "missingApiBody"},
            ],
        },
        {
            code: `class FilesController {
                @Post()
                @ApiConsumes("multipart/form-data")
                upload(@UploadedFiles() files: Express.Multer.File[]) {}
            }`,
            errors: [{messageId: "missingApiBody"}],
        },
        {
            code: `class FilesController {
                @Post()
                @ApiBody({ type: FileUploadDto })
                upload(@UploadedFile() file: Express.Multer.File) {}
            }`,
            errors: [{messageId: "missingApiConsumes"}],
        },
        {
            code: `class FilesController {
                @Post()
                @ApiConsumes("application/json")
                @ApiBody({ type: FileUploadDto })
                upload(@UploadedFile() file: Express.Multer.File) {}
            }`,
            errors: [{messageId: "missingApiConsumes"}],
        },
    ],
});
