import injectableShouldBeProvided from "./injectablesShouldBeProvided/injectableShouldBeProvided";
import providedInjectedShouldMatchFactoryParameters from "./providerInjectedShouldMatchFactory/ProviderInjectedShouldMatchFactory";
import apiPropertyMatchesPropertyOptionality from "./apiPropertyMatchesPropertyOptionality/apiPropertyMatchesPropertyOptionality";
import controllerDecoratedHasApiTags from "./controllerDecoratedHasApiTags/controllerDecoratedHasApiTags";
import apiMethodsShouldSpecifyApiOperation from "./apiMethodsShouldSpecifyApiOperation/apiMethodsShouldSpecifyApiOperation";

const allRules = {
    "api-property-matches-property-optionality":
        apiPropertyMatchesPropertyOptionality,
    "injectable-should-be-provided": injectableShouldBeProvided,
    "provided-injected-should-match-factory-parameters":
        providedInjectedShouldMatchFactoryParameters,
    "controllers-should-supply-api-tags": controllerDecoratedHasApiTags,
    "api-method-should-specify-api-operation":
        apiMethodsShouldSpecifyApiOperation,
};

export default allRules;
