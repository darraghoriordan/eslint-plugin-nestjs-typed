const Configuration = {
    extends: ["@commitlint/config-conventional"],
    /*
     * Resolve and load conventional-changelog-atom from node_modules.
     * Referenced packages must be installed
     */
    parserPreset: "conventional-changelog-conventionalcommits",
    /*
     * Resolve and load @commitlint/format from node_modules.
     * Referenced package must be installed
     */
    formatter: "@commitlint/format",
    /*
     * Any rules defined here will override rules from @commitlint/config-conventional
     */
    rules: {
        "header-max-length": [2, "always", 100],
        "subject-case": [0],
    },
    /*
     * Functions that return true if commitlint should ignore the given message.
     */
    ignores: [(commit) => commit.includes("Merge")],
    /*
     * Whether commitlint uses the default ignore rules.
     */
    defaultIgnores: true,
};

module.exports = Configuration;
