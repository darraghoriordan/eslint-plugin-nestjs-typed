### Rule: swagger-file-upload-should-be-documented

File-upload endpoints need both `@ApiConsumes("multipart/form-data")` and an
`@ApiBody()` schema for generated OpenAPI clients to understand the upload.

This rule is enabled by default in the recommended configuration. Use the
`additionalSwaggerDecorators` option when a custom composite decorator supplies
both pieces of metadata.

#### ❌ This fails

```ts
@Post()
upload(@UploadedFile() file: Express.Multer.File) {}
```

#### ✅ This passes

```ts
@Post()
@ApiConsumes("multipart/form-data")
@ApiBody({ type: FileUploadDto })
upload(@UploadedFile() file: Express.Multer.File) {}
```

See the NestJS [OpenAPI file-upload documentation](https://docs.nestjs.com/openapi/operations#file-upload).
