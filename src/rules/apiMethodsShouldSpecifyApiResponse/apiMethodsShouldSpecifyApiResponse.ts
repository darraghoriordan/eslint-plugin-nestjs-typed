import {TSESTree} from "@typescript-eslint/utils";
import {createRule} from "../../utils/createRule.js";
import {typedTokenHelpers} from "../../utils/typedTokenHelpers.js";

export type ApiMethodShouldSpecifyApiResponseOptions = [
    {
        additionalCustomApiResponseDecorators: string[];
    },
];

export const shouldUseApiResponseDecorator = (
    node: TSESTree.MethodDefinition,
    options: ApiMethodShouldSpecifyApiResponseOptions[0]
): boolean => {
    const hasApiMethodDecorator = typedTokenHelpers.nodeHasDecoratorsNamed(
        node,
        ["Get", "Post", "Put", "Delete", "Patch", "Options", "Head", "All"]
    );

    const hasApiResponseDecorator = typedTokenHelpers.nodeHasDecoratorsNamed(
        node,
        [
            "ApiResponse",
            "ApiOkResponse",
            "ApiCreatedResponse",
            "ApiAcceptedResponse",
            "ApiNoContentResponse",
            "ApiMovedPermanentlyResponse",
            "ApiFoundResponse",
            "ApiBadRequestResponse",
            "ApiUnauthorizedResponse",
            "ApiTooManyRequestsResponse",
            "ApiNotFoundResponse",
            "ApiInternalServerErrorResponse",
            "ApiBadGatewayResponse",
            "ApiConflictResponse",
            "ApiForbiddenResponse",
            "ApiGatewayTimeoutResponse",
            "ApiGoneResponse",
            "ApiMethodNotAllowedResponse",
            "ApiNotAcceptableResponse",
            "ApiNotImplementedResponse",
            "ApiPreconditionFailedResponse",
            "ApiPayloadTooLargeResponse",
            "ApiRequestTimeoutResponse",
            "ApiServiceUnavailableResponse",
            "ApiUnprocessableEntityResponse",
            "ApiUnsupportedMediaTypeResponse",
            "ApiDefaultResponse",
        ]
    );

    const hasCustomApiResponseDecorator =
        typedTokenHelpers.nodeHasDecoratorsNamed(
            node,
            options.additionalCustomApiResponseDecorators
        );

    // check if the containing class has ApiExcludeController decorator
    const containingClass = node.parent?.parent as TSESTree.ClassDeclaration;
    const hasApiExcludeControllerDecorator =
        typedTokenHelpers.nodeHasDecoratorsNamed(containingClass, [
            "ApiExcludeController",
        ]);

    return (
        hasApiMethodDecorator &&
        !hasApiResponseDecorator &&
        !hasApiExcludeControllerDecorator &&
        !hasCustomApiResponseDecorator
    );
};

const rule = createRule<
    ApiMethodShouldSpecifyApiResponseOptions,
    "shouldSpecifyApiResponse"
>({
    name: "api-method-should-specify-api-response",
    meta: {
        docs: {
            description:
                "Api methods should at least specify the expected OK response with @ApiOkResponse. But also add any error responses that might not be expected (e.g. 429)",
        },
        messages: {
            shouldSpecifyApiResponse: `A method decorated with @Get, @Post etc. should specify the expected ApiResponse e.g. @ApiOkResponse(type: MyType). These decorators are in the @nestjs/swagger npm package.`,
        },
        schema: [
            {
                type: "object",
                properties: {
                    additionalCustomApiResponseDecorators: {
                        description:
                            "A list of custom api response decorators that this rule will use to validate",
                        type: "array",
                        minItems: 0,
                        items: {
                            type: "string",
                            minLength: 1,
                        },
                    },
                },
            },
        ],
        hasSuggestions: false,
        type: "suggestion",
    },
    defaultOptions: [
        {additionalCustomApiResponseDecorators: new Array<string>()},
    ],

    create(context) {
        const {additionalCustomApiResponseDecorators} =
            context.options[0] ||
            ({
                additionalCustomApiResponseDecorators: [],
            } satisfies ApiMethodShouldSpecifyApiResponseOptions[0]);

        return {
            MethodDefinition(node: TSESTree.MethodDefinition): void {
                if (
                    shouldUseApiResponseDecorator(node, {
                        additionalCustomApiResponseDecorators,
                    })
                ) {
                    context.report({
                        node: node,
                        messageId: "shouldSpecifyApiResponse",
                    });
                }
            },
        };
    },
});

export default rule;
