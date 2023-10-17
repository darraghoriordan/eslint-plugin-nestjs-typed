import injectableShouldBeProvided from "./injectablesShouldBeProvided/injectableShouldBeProvided";
import providedInjectedShouldMatchFactoryParameters from "./providerInjectedShouldMatchFactory/ProviderInjectedShouldMatchFactory";
import apiPropertyMatchesPropertyOptionality from "./apiPropertyMatchesPropertyOptionality/apiPropertyMatchesPropertyOptionality";
import controllerDecoratedHasApiTags from "./controllerDecoratedHasApiTags/controllerDecoratedHasApiTags";
import apiMethodsShouldSpecifyApiResponse from "./apiMethodsShouldSpecifyApiResponse/apiMethodsShouldSpecifyApiResponse";
import apiEnumPropertyBestPractices from "./apiEnumPropertyBestPractices/apiEnumPropertyBestPractices";
import apiPropertyReturningArrayShouldSetArray from "./apiPropertyReturningArrayShouldSetArray/apiPropertyReturningArrayShouldSetArray";
import shouldSpecifyForbidUnknownValues from "./shouldSpecifyForbidUnknownValues/shouldSpecifyForbidUnknownValuesRule";
import parameterDecoratorNameMatchesRouteParam from "./paramDecoratorNameMatchesRouteParam/paramDecoratorNameMatchesRouteParam";
import validateNonPrimitiveNeedsDecorators from "./validateNonPrimitiveNeedsTypeDecorator/validateNonPrimitiveNeedsDecorators";
import validateNestedOfArrayShouldSetEach from "./validateNestedOfArrayShouldSetEach/validateNestedOfArrayShouldSetEach";
import allPropertiesAreWhitelisted from "./allPropertiesAreWhitelisted/allPropertiesAreWhitelisted";
import allPropertiesHaveExplicitDefined from "./allPropertiesHaveExplicitDefined/allPropertiesHaveExplicitDefined";
import apiMethodsShouldBeGuarded from "./apiMethodsShouldBeGuarded/apiMethodsShouldBeGuarded";
import apiMethodsShouldSpecifyApiOperation from "./apiMethodsShouldSpecifyApiOperation/apiMethodsShouldSpecifyApiOperation";
import sortModuleMetadataArrays from "./sortModuleMetadataArrays/sortModuleMetadataArrays";
import noDuplicateDecorators from "./noDuplicateDecorators/noDuplicateDecorators";
const allRules = {
    "all-properties-have-explicit-defined": allPropertiesHaveExplicitDefined,
    "api-property-matches-property-optionality":
        apiPropertyMatchesPropertyOptionality,
    "injectable-should-be-provided": injectableShouldBeProvided,
    "no-duplicate-decorators": noDuplicateDecorators,
    "provided-injected-should-match-factory-parameters":
        providedInjectedShouldMatchFactoryParameters,
    "controllers-should-supply-api-tags": controllerDecoratedHasApiTags,
    "api-method-should-specify-api-response":
        apiMethodsShouldSpecifyApiResponse,
    "api-method-should-specify-api-operation":
        apiMethodsShouldSpecifyApiOperation,
    "api-enum-property-best-practices": apiEnumPropertyBestPractices,
    "api-property-returning-array-should-set-array":
        apiPropertyReturningArrayShouldSetArray,
    "should-specify-forbid-unknown-values": shouldSpecifyForbidUnknownValues,
    "param-decorator-name-matches-route-param":
        parameterDecoratorNameMatchesRouteParam,
    "validated-non-primitive-property-needs-type-decorator":
        validateNonPrimitiveNeedsDecorators,
    "validate-nested-of-array-should-set-each":
        validateNestedOfArrayShouldSetEach,
    "all-properties-are-whitelisted": allPropertiesAreWhitelisted,
    "api-methods-should-be-guarded": apiMethodsShouldBeGuarded,
    "sort-module-metadata-arrays": sortModuleMetadataArrays,
};

export default allRules;
