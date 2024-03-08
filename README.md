## metric-gardener - static source code parser

One parser for all languages!
No need to build your source code.
This static source code parser calculates simple software quality metrics for quite a few languages (more will be added).

An experimental approach is implemented to approximate couplings metrics for C# and PHP without you having to build the source code.
This is quite slow and can take up to one or two hours but can provide good results.

**It is based on grammars from [tree-sitter](https://github.com/tree-sitter/tree-sitter).**

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

-   Go
-   PHP
-   TypeScript
-   Java
-   C#
-   C++
-   Python
-   JavaScript
-   Kotlin

#### Basic support with missing or incomplete unit tests:

-   Ruby
-   Rust
-   Bash (the binary logical operators -o for "or" and -a for "and" are currently not evaluated due to issues with tree-sitter-bash. For the same reason, the && and || operators are not evaluated if placed after the first heredoc delimiter. Default labels in Switch-statement are treated as regular case labels.)
-   C (take a look at the CLI option [`parse-h-as-c`](#command-line-options-for-the-parse-command) or [`parse-some-h-as-c`](#command-line-options-for-the-parse-command) for parsing `.h` C headers as C)

### Supported File Metrics

**complexity**<br>
Counts expressions that branch the control flow, like if-statements, loops, switch case labels, catch-blocks etc. - but no else/default/finally statements. Also counts the following other expressions that are considered to increase the complexity of the code inside a file:

-   function declarations (see functions metric below)
-   binary logical operations (like AND and OR)

**functions**<br>
The number of function declarations inside a file. Includes all kinds of functions, like constructors, lambda functions, member functions, abstract functions, constructors, init blocks, closures, etc.

**classes**<br>
<<<<<<< HEAD
The number of class definitions inside a file, also counting for enums, interfaces, structs, unions, traits and records.

<details><summary>Language specific details</summary>

| Syntax    | Description                                                                                                                                             |
| --------- | ------------------------------------------------------------------------------------------------------------------------------------------------------- |
| JS/TS/TSX | Counts type declarations with object type literal like `type book = {title: string};`. Type alias like `type alias_type = number;` will not be counted. |

</details>

**lines_of_code**<br>
The total number of lines of a file, including empty lines, comments, etc.

**comment_lines**<br>
The number of comment lines inside a file. Does count for any kind of comment (except for python's special block comments).

**real_lines_of_code**<br>
The number of lines inside a file that contain actual code of the programming language, not counting for comments, empty lines, etc.

### Command line options for the `parse` command

`--help`<br>
Shows an overview over all options and their usage

`--output-path`, `-o`<br>
Specifies the location on which the .json-file with the results should be stored, e.g. `./metrics.json`. This is required.

`--relative-paths`, `-r`<br>
Write paths to the analyzed files in the output .json-file relative to the source directory instead of writing the absolute paths to the files. E.g. writes `src/package1/file1.java` instead of `/home/user.name/programming/project1/src/package1/file1.java` (works also for Windows-style paths).

`--exclusions`, `-e`<br>
Excludes the specified folders from being scanned for files to be analyzed. Can be an arbitrarily nested subdirectory, so something like `--exclusions "folder1"` does exclude `src/package1/folder1`. Does exclude all files in the folder itself as well as in all subdirectories of the folder.

`--parse-h-as-c`, `--hc`<br>
Parse all files with the file extension `.h` as files written in the C programming language instead of C++. Defaults to C++, as the C++ grammar is mostly a superset of the C grammar.

`--parse-some-h-as-c`, `--shc`<br>
Parse all files inside the specified folders that have the file extension `.h` as files written in the C programming language instead of C++. Defaults to C++. Can be also used for file names, e.g. `--shc header-file.h`. Similar to `--exclusions`, the folder/file can lie in an arbitrary subdirectory and the option applies to all files in all subdirectories of the specified folder(s).

`--compress`, `-c`<br>
Compresses the output .json-file into an zip-archive.

`--parse-dependencies`<br>
EXPERIMENTAL - VERY SLOW AND NOT READY FOR PRODUCTIVE USE YET<br>
Performs a dependency analysis and appends the results to the output .json-file (see [below](#experimental-coupling-metrics)).

### Updating tree-sitter grammars and adding support for more languages

Take a look at [UPDATE_GRAMMARS.md](UPDATE_GRAMMARS.md) for further information on what to do if you have updated the tree-sitter grammars installed as dependency of this project. You also find information about adding support for an additional programming language there.

### For contributors

Check out our contribution guidelines in the file [CONTRIBUTING.md](CONTRIBUTING.md).

### Enable debug prints

There are additional outputs about the metric calculation process that can be enabled by setting the
environment variable `NODE_DEBUG` to `metric-gardener`.

### Experimental Coupling Metrics

**EXPERIMENTAL - VERY SLOW AND NOT READY FOR PRODUCTIVE USE YET**

**Supported for C# and PHP**<br>
Activate dependency analysis by passing `--parseDependencies`

-   Coupling Between Objects (CBO)
-   Incoming Dependencies
-   Outgoing Dependencies
-   Instability: Outgoing Dependencies / (Outgoing Dependencies + Incoming Dependencies)

**Limitations:**<br>

-   Multiple, nested Namespace Declarations within one .cs file are not covered so far and are ignored during the calculation of coupling.

### TODOs

Next Steps:

-   Apply new activated_for_languages flag in node-types-mapped.config for conflicting expressions.
-   Documentation, e.g.: Document the used Query Captures to be able to implement new languages as a developer
-   Configurable language specifics (has heavy candidate building, has generics, etc.)

Performance Optimizations:

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
-   Checkout sample project(s) per language and parse them as an automatic test
-   ProgressBar
-   Separate Infrastructure from Domain Code
