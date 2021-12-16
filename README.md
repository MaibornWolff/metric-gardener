## This is a node based parser to calculate metrics

### Supported Languages

-   Stable

    -   PHP
    -   TypeScript

-   Unstable (no or incomplete unit tests)

    -   C#
    -   Java
    -   JavaScript
    -   Kotlin

    -   Go

### Supported Metrics

-   mcc
-   functions
-   classes
-   lines_of_code (not unit tested)
-   comment_lines (not unit tested)
-   real_lines_of_code (not unit tested)

### Usage

Install and parse your sources:

-   `npm install`
-   `npm run start -- parse /path/to/sources -o /output/file/path.json` specify the path to a folder or a file to be parsed and specify output file path.
-   `npm run start -- import-grammars` (re-)import grammar expression types for supported languages from tree-sitter grammar npm packages.
    This will have no effect until you have mapped the changed and new expressions manually to ./resources/node-types-mapped.config

# Dependency Graph Exploration with Neo4J:

-   For object-oriented metrics setup neo4j DB.
-   Be sure a local Neo4j server is running under neo4j://localhost:7687
-   You can simply run a Neo4j docker container:

    -   `cd projects/node-parser/`
    -   Windows:`docker run --publish=7474:7474 --publish=7687:7687 --volume=${PWD}/neo4j/data:/data neo4j`
    -   Unix: `docker run --publish=7474:7474 --publish=7687:7687 --volume=$(pwd)/neo4j/data:/data neo4j`

-   For C# and PHP you can run the experimental dependency analysis by passing `--parse-dependencies`
-   Then, visit `http://localhost:7474/` with `admin/admin` or view coupling data in generated output file

### TODOs

For Publish 0.1.0:

-   Output Format

-   Refactoring
-   Remove neo4j
-   Provide more command line options
-   Performance & Duplicate Adds (see TODO comments)
-   Fix Unit Tests
-   npm publish / github repo

Priority second:

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
