## A parser to calculate metrics for lots of languages

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
    -   Java
    -   JavaScript
    -   Kotlin

### Supported Metrics

-   mcc
-   functions
-   classes
-   lines_of_code (not unit tested)
-   comment_lines (not unit tested)
-   real_lines_of_code (not unit tested)

### Maintenance of tree-sitter grammars

Update grammars of programming languages to be up-to-date
For this, reimport grammars for supported languages from tree-sitter by:

-   `npm run start -- import-grammars`

This will have no effect until you have mapped the changed and new expressions manually to ./resources/node-types-mapped.config

### Dependency Analysis (experimental for C# and PHP)

-   For this, please setup a local neo4j DB.
-   Be sure it is running under neo4j://localhost:7687
-   You can simply run a Neo4j docker container:

    -   `cd projects/node-parser/`
    -   Windows:`docker run --publish=7474:7474 --publish=7687:7687 --volume=${PWD}/neo4j/data:/data neo4j`
    -   Unix: `docker run --publish=7474:7474 --publish=7687:7687 --volume=$(pwd)/neo4j/data:/data neo4j`

-   For C# and PHP you can run the experimental dependency analysis by passing `--parse-dependencies`
-   Then, visit `http://localhost:7474/` with `admin/admin` or view coupling data in generated output file

### TODOs

For Publish 0.1.0:

-   Refactoring
-   Unit Tests

Priority second:

-   npm publish / github repo
-   Performance & Duplicate Adds (see TODO comments)
-   Remove neo4j
-   Typescript coupling graph?
-   CSharp Dependency Parsing finalization? (havy candidate building not implemented yet, not all object access expressions are covered so far)
-   Write command to add new language and map expressions

-   Refactor Abstract Usage Collector (small resolver classes?)
-   Exclude System Namespaces like System in CSharp etc. (Configurable option would also be nice (e.g. exclude NameSpace _UnitTest_))
-   Checkout sample project(s) per language and parse them as an automatically test
-   ProgressBar
-   Separate Infrastructure from Domain Code

-   Support more languages
-   Add more Unit Tests
