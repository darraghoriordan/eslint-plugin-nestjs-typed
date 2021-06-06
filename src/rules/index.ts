import injectableShouldBeProvided from "./injectablesShouldBeProvided/injectableShouldBeProvided";
import providedInjectedShouldMatchFactoryParameters from "./providerInjectedShouldMatchFactory/ProviderInjectedShouldMatchFactory";
import apiPropertyMatchesPropertyOptionality from "./apiPropertyMatchesPropertyOptionality/apiPropertyMatchesPropertyOptionality";
import controllerDecoratedHasApiTags from "./controllerDecoratedHasApiTags/controllerDecoratedHasApiTags";
import apiMethodsShouldSpecifyApiOperation from "./apiMethodsShouldSpecifyApiOperation/apiMethodsShouldSpecifyApiOperation";
import apiEnumPropertyBestPractices from "./apiEnumPropertyBestPractices/apiEnumPropertyBestPractices";
import apiPropertyReturningArrayShouldSetArray from "./apiPropertyReturningArrayShouldSetArray/apiPropertyReturningArrayShouldSetArray";

const allRules = {
    "api-property-matches-property-optionality":
        apiPropertyMatchesPropertyOptionality,
    "injectable-should-be-provided": injectableShouldBeProvided,
    "provided-injected-should-match-factory-parameters":
        providedInjectedShouldMatchFactoryParameters,
    "controllers-should-supply-api-tags": controllerDecoratedHasApiTags,
    "api-method-should-specify-api-operation":
        apiMethodsShouldSpecifyApiOperation,
    "api-enum-property-best-practices": apiEnumPropertyBestPractices,
    "api-property-returning-array-should-set-array":
        apiPropertyReturningArrayShouldSetArray,
};

export default allRules;
