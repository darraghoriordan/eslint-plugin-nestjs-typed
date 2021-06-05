import injectableShouldBeProvided from "./injectablesShouldBeProvided/injectableShouldBeProvided";
import providedInjectedShouldMatchFactoryParameters from "./providerInjectedShouldMatchFactory/ProviderInjectedShouldMatchFactory";
import apiPropertyMatchesPropertyOptionality from "./apiPropertyMatchesPropertyOptionality/apiPropertyMatchesPropertyOptionality";
const allRules = {
    "api-property-matches-property-optionality":
        apiPropertyMatchesPropertyOptionality,
    "injectable-should-be-provided": injectableShouldBeProvided,
    "provided-injected-should-match-factory-parameters":
        providedInjectedShouldMatchFactoryParameters,
};

export default allRules;
