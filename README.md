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
-   `npm run start -- /path/to/sources` specify the path to a folder or a file with source code

The metrics will be printed during parsing.
