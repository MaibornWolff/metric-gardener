# Maintenance and addition of tree-sitter grammars

## Updating grammars

If you update the tree-sitter grammars installed as dependency of this project, you need to update the node types config file found under `./src/parser/config/nodeTypesConfig.json`.
For this, reimport the grammars from all supported languages by running the import script:

-   `npm run start -- import-grammars`

If there are new syntax node types included in the grammars (e.g. because of a new feature of the corresponding programming language), these are still going to be ignored until you have mapped the new node types to the corresponding metric inside the `nodeTypesConfig.json`.

## Adding support for a new programming language

If you want to support a completely new programming language, you have to perform additional steps after installing the grammar as a dependency of this project and before running the import script. Add the language, the file extension(s) of the source code files used by that language and an appropriate shortcut for that language to the enum and the maps inside `./src/helper/Languages.ts`. You also have to add the path to the `node-types.json` of the tree-sitter grammar for that language to `./src/commands/ImportNodeTypes.ts`. After these steps, you can run the import script as mentioned above and run metric-gardener on source code of that newly added language afterwards. Note that metric-gardener can only consider the syntax node types that are already included in one of the already supported language when calculating metrics.
For a correct and stable support of the language, you probably have to add mappings for language-specific syntax node types to the `nodeTypesConfig.json` and add test cases for that language. Perhaps you also have to include a special handling to the metrics calculation to accommodate for some language features.
