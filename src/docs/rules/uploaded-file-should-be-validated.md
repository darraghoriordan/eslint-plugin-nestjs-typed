### Rule: uploaded-file-should-be-validated

Uploaded files should be constrained before application code processes them.
The rule accepts `ParseFilePipe`, `ParseFilePipeBuilder`, or a Multer
`limits.fileSize` option.

This rule is enabled by default in the recommended configuration. Custom pipes
and composite validation decorators can be configured with
`additionalFileValidationPipes` and `additionalFileValidationDecorators`.

#### ❌ This fails

```ts
upload(@UploadedFile() file: Express.Multer.File) {}
```

#### ✅ This passes

```ts
upload(
  @UploadedFile(
    new ParseFilePipeBuilder()
      .addFileTypeValidator({ fileType: "image/jpeg" })
      .addMaxSizeValidator({ maxSize: 5_242_880 })
      .build(),
  )
  file: Express.Multer.File,
) {}
```

See the NestJS [file validation documentation](https://docs.nestjs.com/techniques/file-upload#file-validation).
