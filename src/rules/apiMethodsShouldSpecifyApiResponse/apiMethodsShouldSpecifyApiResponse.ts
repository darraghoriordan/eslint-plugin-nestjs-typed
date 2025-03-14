import {TSESTree} from "@typescript-eslint/utils";
import {createRule} from "../../utils/createRule.js";
import {typedTokenHelpers} from "../../utils/typedTokenHelpers.js";

export const shouldUseApiResponseDecorator = (
    node: TSESTree.MethodDefinition
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

    // check if the containing class has ApiExcludeController decorator
    const containingClass = node.parent?.parent as TSESTree.ClassDeclaration;
    const hasApiExcludeControllerDecorator =
        typedTokenHelpers.nodeHasDecoratorsNamed(containingClass, [
            "ApiExcludeController",
        ]);

    return (
        hasApiMethodDecorator &&
        !hasApiResponseDecorator &&
        !hasApiExcludeControllerDecorator
    );
};

const rule = createRule<[], "shouldSpecifyApiResponse">({
    name: "api-method-should-specify-api-response",
    meta: {
        docs: {
            description:
                "Api methods should at least specify the expected OK response with @ApiOkResponse. But also add any error responses that might not be expected (e.g. 429)",
        },
        messages: {
            shouldSpecifyApiResponse: `A method decorated with @Get, @Post etc. should specify the expected ApiResponse e.g. @ApiOkResponse(type: MyType). These decorators are in the @nestjs/swagger npm package.`,
        },
        schema: [],
        hasSuggestions: false,
        type: "suggestion",
    },
    defaultOptions: [],

    create(context) {
        return {
            MethodDefinition(node: TSESTree.MethodDefinition): void {
                if (shouldUseApiResponseDecorator(node)) {
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
