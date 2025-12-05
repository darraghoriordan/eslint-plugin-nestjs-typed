/* eslint-disable @typescript-eslint/ban-ts-comment */
import {TSESTree, TSESLint} from "@typescript-eslint/utils";
import {createRule} from "../../utils/createRule.js";
// import FileEnumeratorWrapper from "../../utils/files/fileEnumerationWrapper";
import NestProvidedInjectableMapper from "../../utils/nestModules/nestProvidedInjectableMapper.js";
import {NestProvidedInjectablesMap} from "../../utils/nestModules/models/NestProvidedInjectablesMap.js";
import {typedTokenHelpers} from "../../utils/typedTokenHelpers.js";
import {FilePath} from "eslint/use-at-your-own-risk";
import {JSONSchema4TypeName} from "@typescript-eslint/utils/json-schema";
import {RuleContext} from "@typescript-eslint/utils/ts-eslint";
import FileEnumeratorWrapper from "../../utils/files/customFileEnumeratorWrapper.js";

let listOfPotentialNestModuleFiles: FilePath[];
let nestModuleMap: Map<string, NestProvidedInjectablesMap>;

type Options = [
    {
        src: string[];
        filterFromPaths: string[];
    },
];

const findModuleMappingsContaining = (
    className: string,
    propertyName: "controllers" | "providers",
    nestModuleMap: Map<string, NestProvidedInjectablesMap>
): [string, NestProvidedInjectablesMap][] => {
    // eslint-disable-next-line @typescript-eslint/naming-convention, @typescript-eslint/no-unused-vars
    const modules = [...nestModuleMap.entries()].filter(([_, entry]) => {
        return entry[propertyName].has(className);
    });

    return modules;
};
function convertNestModuleMapToString(
    nestModules: [string, NestProvidedInjectablesMap][]
): string {
    // const uniqueValues = new Set<string>();
    const vals: string[] = [];
    nestModules.forEach((module) => {
        // Add all paths
        vals.push(module[0]);
    });

    // Convert the Set to an array and join with commas
    // return Array.from(uniqueValues).join(", ");
    return vals.join(", ");
}
const checkNode = (
    // super fragile types but whatevs
    node: TSESTree.ClassDeclaration,
    decoratorName: "Injectable" | "Controller",
    propertyName: "controllers" | "providers",
    messageId: "injectableInModule" | "controllersInModule",
    context: Readonly<
        TSESLint.RuleContext<
            "injectableInModule" | "controllersInModule",
            Options
        >
    >
) => {
    if (
        NestProvidedInjectableMapper.isNestInjectableThatIsNeverProvided(node)
    ) {
        return;
    }
    if (typedTokenHelpers.nodeHasDecoratorsNamed(node, [decoratorName])) {
        const name = node.id?.name;
        if (!name) {
            return;
        }
        const foundModuleMaps = findModuleMappingsContaining(
            name,
            propertyName,
            nestModuleMap
        );

        if (foundModuleMaps.length === 1) {
            return;
        }
        // couldn't find map so error
        context.report({
            node: node,
            messageId: messageId,
            data: {
                numberOfReferences: foundModuleMaps.length,

                refLocations: convertNestModuleMapToString(foundModuleMaps),
                name: name,
            },
        });
    }
};

function initializeModuleMappings(
    sourcePath: string,
    filterFromPaths: string[],
    context: Readonly<TSESLint.RuleContext<never, Options>>
) {
    const mappedSourceDirectory =
        NestProvidedInjectableMapper.detectDirectoryToScanForFiles(
            sourcePath,
            process.cwd()
        );

    listOfPotentialNestModuleFiles = FileEnumeratorWrapper.enumerateFiles({
        sourceGlobs: mappedSourceDirectory,
        extensions: [".ts"],
        filterFromPaths,
    });

    nestModuleMap = NestProvidedInjectableMapper.parseFileList(
        listOfPotentialNestModuleFiles,
        context
    );
}
const defaultOptions = [
    {
        src: ["src/**/*.ts"],
        filterFromPaths: ["dist", "node_modules", ".test.", ".spec."],
    },
] as Options;
const rule = createRule<Options, "injectableInModule" | "controllersInModule">({
    name: "injectable-should-be-provided",
    meta: {
        docs: {
            description: "Public api methods should have documentation",
        },
        messages: {
            injectableInModule: `Expected Injectable "{{name}}" to be referenced in 1 module's providers array, but found {{numberOfReferences}} references ({{refLocations}}). If you added it already but this error still shows in your editor, please change one character in the injectable file to poke your eslint plugin.`,
            controllersInModule: `Expected Controller "{{name}}" to be referenced in 1 module's controllers array, but found {{numberOfReferences}} references ({{refLocations}}). If you added it already but this error still shows in your editor, please change one character in the controller file to poke your eslint plugin.`,
        },
        schema: [
            {
                type: "object" as JSONSchema4TypeName,
                additionalProperties: false,
                properties: {
                    src: {
                        description:
                            "files/paths to be analyzed (only for provided injectable or controller)",
                        type: "array" as JSONSchema4TypeName,
                        minItems: 1,
                        items: {
                            type: "string" as JSONSchema4TypeName,
                            minLength: 1,
                        },
                    },
                    filterFromPaths: {
                        description:
                            "strings to exclude from checks (only for provided injectable or controller)",
                        type: "array" as JSONSchema4TypeName,
                        minItems: 1,
                        items: {
                            type: "string" as JSONSchema4TypeName,
                            minLength: 1,
                        },
                    },
                },
            },
        ],
        type: "problem",
    },
    defaultOptions: defaultOptions,

    create(contextWithoutDefaults) {
        // @ts-ignore

        const context =
            contextWithoutDefaults.options &&
            contextWithoutDefaults.options.length > 0
                ? contextWithoutDefaults
                : // only apply the defaults when the user provides no config
                  (Object.setPrototypeOf(
                      {
                          options: defaultOptions,
                      },
                      contextWithoutDefaults
                  ) as Readonly<
                      RuleContext<
                          "injectableInModule" | "controllersInModule",
                          Options
                      >
                  >);

        const {src, filterFromPaths} = context.options[0] || {};

        if (nestModuleMap === undefined || nestModuleMap.size === 0) {
            initializeModuleMappings(src[0], filterFromPaths, context);
        }

        return {
            ClassDeclaration(node: TSESTree.ClassDeclaration): void {
                checkNode(
                    node,
                    "Injectable",
                    "providers",
                    "injectableInModule",
                    context
                );
                checkNode(
                    node,
                    "Controller",
                    "controllers",
                    "controllersInModule",
                    context
                );
            },
            "Program:exit"(): void {
                // map the source to a mapping thing
                // if not undefined set it to the mapping set
                const mappedProvidedInjectables =
                    NestProvidedInjectableMapper.mapAllProvidedInjectablesInModuleOrProviderFile(
                        context.sourceCode.ast,
                        context.filename
                    );
                if (mappedProvidedInjectables !== null) {
                    nestModuleMap.set(
                        mappedProvidedInjectables[0],
                        mappedProvidedInjectables[1]
                    );
                }
            },
        };
    },
});

export default rule;
