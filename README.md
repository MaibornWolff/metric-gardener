## metric-gardener - static source code parser

One parser for all languages!
No need to build your source code.
This static source code parser calculates simple software quality metrics for quite a few languages (more will be added).

An experimental approach is implemented to approximate couplings metrics for C# and PHP without you having to build the source code.
This is quite slow and can take up to one or two hours but can provide good results.

**It is based on grammars from [tree-sitter](https://github.com/tree-sitter/tree-sitter).**

### Main Issues with MetricGardener

-   It is not very well tested.
-   The performance is very bad currently.

### Usage

#### Install required build tools:

-   This project is based upon Node.js. Therefore, there has to be a recent version of Node.js installed on your machine (see `engines` entry of package.json for version requirements).
-   Ensure that you have installed all build tools necessary to compile the native C/C++ parts of the required tree-sitter package: https://github.com/nodejs/node-gyp#installation

#### Install project and parse your sources:

-   `npm install`
-   `npm run start -- parse /path/to/sources -o /output/file/path.json` specify the path to a folder or a file to be parsed and specify output file path.

#### Global installation via npm

-   `npm install -g metric-gardener`
-   `metric-gardener parse /path/to/sources -o /output/file/path.json`

#### Local as a npm dependency

-   `npm install metric-gardener`
-   `npm exec metric-gardener /path/to/sources -o /output/file/path.json`

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
-   lines_of_code - The total number of lines of a file, including empty lines, comments, etc.
-   comment_lines - The number of comment lines inside a file. Does count for any kind of comment (except for python's special block comments).
-   real_lines_of_code (not unit tested) - The number of lines inside a file, not counting for comments and empty lines.

### Coupling Metrics (experimental)

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

This will have no effect until you have mapped the changed and new expressions manually to ./src/parser/config/nodeTypesConfig.json

### Enable debug prints

There are additional outputs about the metric calculation process that can be enabled by setting the
environment variable `NODE_DEBUG` to `metric-gardener`.

### TODOs

Next Steps:

-   Apply new activated_for_languages flag in node-types-mapped.config for conflicting expressions.
-   Write Unit tests for basic metrics for other supported languages
-   Documentation, e.g.: Document the used Query Captures to be able to implement new languages as a developer
-   Configurable language specifics (has heavy candidate building, has generics, etc.)

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
