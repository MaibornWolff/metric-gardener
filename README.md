## metric-gardener - static source code parser

One parser for all languages!
No need to build your source code.
This static source code parser calculates simple software quality metrics for quite a few languages (more will be added).

An experimental approach is implemented to approximate couplings metrics for C# and PHP without you having to build the source code.
This is quite slow and can take up to one or two hours but can provide good results.

**It is based on grammars from [tree-sitter](https://github.com/tree-sitter/tree-sitter).**

### Main Issues with MetricGardener

1.  It is not very well tested
2.  Because of 1., there might be some issues for certain languages
3.  The list of supported languages is still rather limited

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
    -   Java
    -   C#
    -   C++

-   Unstable (missing or incomplete unit tests)
    -   Python
    -   JavaScript
    -   Kotlin

### Supported File Metrics

**complexity**<br>
Counts expressions that branch the control flow, like if-statements, loops, catch-blocks, etc. - but no else/default/finally statements. Also counts the following other expressions that are considered to increase the complexity of the code inside a file:

-   function declarations (including lambda expressions)
-   binary logical operations (like AND and OR)

NOTE: for now, the metric also counts default statements in switch-case-blocks for these languages: Java, C++, Python and Kotlin.

**functions**<br>
The number of function definitions inside a file. Includes all kinds of functions, like constructors, lambda functions, member functions, etc.

**classes**<br>
The number of class definitions inside a file, also counting for enums, interfaces, structs and records.

**lines_of_code**<br>
The total number of lines of a file, including empty lines, comments, etc.

**comment_lines**<br>
The number of comment lines inside a file. Does count for any kind of comment (except for python's special block comments).

**real_lines_of_code**<br>
The number of lines inside a file that contain actual code of the programming language, not counting for comments, empty lines, etc.

### Coupling Metrics (experimental)

**Supported for C# and PHP**<br>
Activate dependency analysis by passing `--parseDependencies`

-   Coupling Between Objects (CBO)
-   Incoming Dependencies
-   Outgoing Dependencies
-   Instability: Outgoing Dependencies / (Outgoing Dependencies + Incoming Dependencies)

**Limitations:**<br>

-   Multiple, nested Namespace Declarations within one .cs file are not covered so far and are ignored during the calculation of coupling.

### Updating tree-sitter grammars and adding support for more languages

Take a look at [UPDATE_GRAMMARS.md](UPDATE_GRAMMARS.md) for further information on what to do if you have updated the tree-sitter grammars installed as dependency of this project. You also find information about adding support for an additional programming language there.

### For contributors

Check out our contribution guidelines in the file [CONTRIBUTING.md](CONTRIBUTING.md).

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
