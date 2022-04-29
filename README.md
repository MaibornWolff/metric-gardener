## A parser to calculate metrics for lots of languages

This parser calculates simple metrics for lots of languages.
For certain languages, an estimation of coupling metrics helps to assess the quality of software architecture.

**It is based on grammars from [tree-sitter](https://github.com/tree-sitter/tree-sitter).**

### Usage

Install and parse your sources:

-   `npm install`
-   `npm run start -- parse /path/to/sources -o /output/file/path.json` specify the path to a folder or a file to be parsed and specify output file path.

### Supported Languages

-   Stable

    -   Go
    -   PHP
    -   TypeScript

-   Unstable (missing or incomplete unit tests)
    -   C#
    -   C++
    -   Java
    -   JavaScript
    -   Kotlin
    -   Python

### Supported Metrics

-   mcc
-   functions
-   classes
-   lines_of_code (not unit tested)
-   comment_lines (not unit tested)
-   real_lines_of_code (not unit tested)

### Coupling Metrics

**Supported for C# and PHP**<br>
Activate dependency analysis by passing `--parseDependencies`

-   Coupling Between Objects (CBO)
-   Incoming Dependencies
-   Outgoing Dependencies
-   Instability: Outgoing Dependencies / (Outgoing Dependencies + Incoming Dependencies)

**Limitations:**<br>

-   Multiple, nested Namespace Declarations within one .cs file are not covered so far and are ignored during the calculation of coupling.

### Maintenance of tree-sitter grammars

Update grammars of programming languages to be up-to-date
For this, reimport grammars for supported languages from tree-sitter by:

-   `npm run start -- import-grammars`

This will have no effect until you have mapped the changed and new expressions manually to ./resources/node-types-mapped.config

### TODOs

Next Steps:

-   Apply new activated_for_languages flag in node-types-mapped.config for conflicting expressions.
-   Write Unit tests for basic metrics for other supported languages
-   Documentation, e.g.: Document the used Query Captures to be able to implement new languages as a developer
-   Configurable language specifics (has heavy candidate building, has generics, etc.)
-   npm publish / github repo

Performance Optimizations:

-   Mapped Expressions: Query expressions for current language only instead of brute force all available metric expressions
-   Skip primitive types like (void, boolean, etc.) during accessor scan and usage candidates building
-   Exclude System Namespaces like System in CSharp etc. (Configurable option would also be nice (e.g. exclude NameSpace _UnitTest_))
-   Improve performance in Abstract Usage Collector (add candidates only if they can be found in previously retrieved fully qualified type names in other words the Namespace Collector).

Refactoring Todos:

-   Rename callExpression Resolver to accessor Resolver
-   Refactor Abstract Usage Collector (small resolver classes?)

Other TODOs and ideas:

-   Verbose Mode to output calculated metrics (-v), executed queries (-vv), ect.
-   Add more Unit Tests (Helpers, QueryResolver, TreeParser, etc.)
-   Implement CK Metrics, Cyclic Dependencies Metric, etc. without neo4j
-   Performance & Duplicate Adds (see TODO comments)
-   Export relationships as a graph file
-   Write command to add new language and map expressions
-   Checkout sample project(s) per language and parse them as an automatically test
-   ProgressBar
-   Separate Infrastructure from Domain Code
-   Support more languages
