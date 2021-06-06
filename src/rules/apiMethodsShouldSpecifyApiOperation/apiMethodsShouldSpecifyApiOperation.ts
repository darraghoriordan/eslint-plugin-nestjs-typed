// Import { getParserServices } from "@typescript-eslint/experimental-utils/dist/eslint-utils";
// import * as tsutils from "tsutils";
// import { getParserServices } from "@typescript-eslint/experimental-utils/dist/eslint-utils";
import {TSESTree} from "@typescript-eslint/types";
import {createRule} from "../../utils/createRule";
import {typedTokenHelpers} from "../../utils/typedTokenHelpers";

export const shouldUseApiOperationDecorator = (
    node: TSESTree.MethodDefinition
): boolean => {
    const hasApiMethodDecorator = typedTokenHelpers.nodeHasDecoratorsNamed(
        node,
        ["Get", "Post", "Put", "Delete", "Patch", "Options", "Head", "All"]
    );

    const hasApiOperationDecorator = typedTokenHelpers.nodeHasDecoratorsNamed(
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

    return hasApiMethodDecorator && !hasApiOperationDecorator;
};

const rule = createRule({
    name: "api-method-should-specify-api-operation",
    meta: {
        docs: {
            description:
                "Api methods should at least specify the expected OK response with @ApiOkResponse. But also add any error responses that might not be expected (e.g. 429)",
            category: "Best Practices",
            recommended: false,
            requiresTypeChecking: false,
        },
        messages: {
            shouldSpecifyApiOperation: `A method decorated with @Get, @Post etc. should specify the expected ApiOperation e.g. @ApiOkResponse(type: MyType)`,
        },
        schema: [],
        type: "suggestion",
    },
    defaultOptions: [],

    create(context) {
        return {
            // eslint-disable-next-line @typescript-eslint/naming-convention
            MethodDefinition(node: TSESTree.MethodDefinition): void {
                if (shouldUseApiOperationDecorator(node)) {
                    context.report({
                        node: node,
                        messageId: "shouldSpecifyApiOperation",
                    });
                }
            },
        };
    },
});

export default rule;
