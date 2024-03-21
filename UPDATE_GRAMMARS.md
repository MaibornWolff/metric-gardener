# Maintenance and addition of tree-sitter grammars

## Updating grammars

If you update the tree-sitter grammars installed as dependency of this project, you need to update the node types config file [nodeTypesConfig.json](src%2Fparser%2Fconfig%2FnodeTypesConfig.json).
For this, reimport the grammars from all supported languages by running the import script:

-   `npm run start -- import-grammars`

If there are new syntax node types included in the grammars (e.g. because of a new feature of the corresponding programming language), these are still going to be ignored until you have mapped the new node types to the corresponding metric inside the `nodeTypesConfig.json`.

## Adding support for a new programming language

If you want to support a completely new programming language, you have to perform additional steps after installing the grammar as a dependency of this project and before running the import script:

-   Add the language, the file extension(s) of the source code files used by that language and an appropriate shortcut for that language to the enum and the maps inside [Language.ts](src%2Fparser%2Fhelper%2FLanguage.ts).
-   You also have to add the path to the [nodeTypesConfig.json](src/parser/config/nodeTypesConfig.json) of the tree-sitter grammar for that language to [ImportNodeTypes.ts](src%2Fcommands%2Fimport-grammars%2FImportNodeTypes.ts).
-   After these steps, you can run the import script via `npm run start -- import-grammars` as mentioned above.
-   You can now run metric-gardener on source code of that newly added language.

**Note:**
metric-gardener can only consider the syntax node types that are already included in one of the already supported language when calculating metrics.
For a correct and stable support of the language, you probably have to add mappings from language-specific syntax node types to some metrics inside the [nodeTypesConfig.json](src%2Fparser%2Fconfig%2FnodeTypesConfig.json). If a syntax node type has a different semantic to a syntax node type of another language that is counted for a metric, you might have to use the `deactivated_for_languages` field of that syntax node type to not include it for your language. You should also add test cases for that language. Under some circumstances, you also have to include a special handling to the source code of the metric calculation to accommodate for some language features.
