## This is a node based parser to calculate metrics

### Supported Languages

-   C# (no unit tests -> not stable)
-   Java (no unit tests -> not stable)
-   JavaScript (no unit tests -> not stable)
-   Kotlin (no unit tests-> not stable)

-   Go (incompletely unit tested -> not stable)

-   PHP (all metrics unit tested -> stable)
-   TypeScript (all metrics unit tested -> stable)

### Supported Metrics

-   mcc
-   functions
-   classes

### Usage

-   `npm install`
-   `npm run start` to parse some provided example code
-   `npm run start -- /path/to/sources -o /output/file/path.json` specify the path to a folder or a file with source code

The metrics will be printed during parsing and passed to ./resources/output.json file.

### TODOs

-   Performance
-   Separate Infrastructure from Domain Code
-   Provide more command line options
-   Write command to add new language and map expressions
-   Write command to generate/import specified node-types.json files
-   Support more languages
-   Handle multiple file extensions during parsing on the fly
-   Output calculated metrics in a file/json
-   Execute language specific metrics (e.g. CouplingCSharp) only if necessary
-   Unit Tests
