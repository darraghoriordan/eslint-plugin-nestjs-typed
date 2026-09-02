import {RuleTester} from "@typescript-eslint/rule-tester";
import {getFixturesRootDirectory} from "../../testing/fixtureSetup.js";
import rule, {
    type UploadedFileShouldBeValidatedOptions,
} from "./uploadedFileShouldBeValidated.js";

const ruleTester = new RuleTester({
    languageOptions: {
        parserOptions: {
            ecmaVersion: 2015,
            tsconfigRootDir: getFixturesRootDirectory(),
            project: "./tsconfig.json",
        },
    },
});

ruleTester.run("uploaded-file-should-be-validated", rule, {
    valid: [
        {
            code: `class FilesController {
                upload(
                    @UploadedFile(new ParseFilePipe({ validators: [] }))
                    file: Express.Multer.File,
                ) {}
            }`,
        },
        {
            code: `class FilesController {
                upload(
                    @UploadedFiles(
                        new ParseFilePipeBuilder()
                            .addMaxSizeValidator({ maxSize: 1024 })
                            .build(),
                    )
                    files: Express.Multer.File[],
                ) {}
            }`,
        },
        {
            code: `class FilesController {
                @UseInterceptors(FileInterceptor("file", {
                    limits: { fileSize: 1024 },
                }))
                upload(@UploadedFile() file: Express.Multer.File) {}
            }`,
        },
        {
            code: `class FilesController {
                @UseInterceptors(FilesInterceptor("files", 5, {
                    limits: { fileSize: 1024 },
                }))
                upload(@UploadedFiles() files: Express.Multer.File[]) {}
            }`,
        },
        {
            options: [
                {
                    additionalFileValidationDecorators: [],
                    additionalFileValidationPipes: ["ImageValidationPipe"],
                },
            ] satisfies UploadedFileShouldBeValidatedOptions,
            code: `class FilesController {
                upload(
                    @UploadedFile(new ImageValidationPipe())
                    file: Express.Multer.File,
                ) {}
            }`,
        },
        {
            code: `class FilesController {
                upload(
                    @UploadedFile(ParseFilePipe)
                    file: Express.Multer.File,
                ) {}
            }`,
        },
        {
            options: [
                {
                    additionalFileValidationDecorators: ["ValidatedUpload"],
                    additionalFileValidationPipes: [],
                },
            ] satisfies UploadedFileShouldBeValidatedOptions,
            code: `class FilesController {
                @ValidatedUpload()
                upload(@UploadedFile() file: Express.Multer.File) {}
            }`,
        },
        {
            code: `class FilesController {
                upload(body: string) {}
            }`,
        },
    ],
    invalid: [
        {
            code: `class FilesController {
                upload(@UploadedFile() file: Express.Multer.File) {}
            }`,
            errors: [{messageId: "missingFileValidation"}],
        },
        {
            code: `class FilesController {
                upload(@UploadedFiles() files: Express.Multer.File[]) {}
            }`,
            errors: [{messageId: "missingFileValidation"}],
        },
        {
            code: `class FilesController {
                @UseInterceptors(FileInterceptor("file"))
                upload(@UploadedFile() file: Express.Multer.File) {}
            }`,
            errors: [{messageId: "missingFileValidation"}],
        },
    ],
});
