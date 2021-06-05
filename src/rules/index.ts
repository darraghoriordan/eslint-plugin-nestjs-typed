import apiMethodsHaveDocumentation from "./apiMethodsHaveDocumentation/apiMethodsHaveDocumentation";
import injectableShouldBeProvided from "./injectablesShouldBeProvided/injectableShouldBeProvided";
import providedInjectedShouldMatchFactoryParameters from "./providerInjectedShouldMatchFactory/ProviderInjectedShouldMatchFactory";

const allRules = {
    "api-methods-have-documentation": apiMethodsHaveDocumentation,
    "injectable-should-be-provided": injectableShouldBeProvided,
    "provided-injected-should-match-factory-parameters":
        providedInjectedShouldMatchFactoryParameters,
};

export default allRules;
