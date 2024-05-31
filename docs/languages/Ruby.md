# File Metrics for Ruby

This document outlines the definition of file metrics for Ruby.

### complexity

The "complexity" metric counts:

-   `if` and `elsif` statements
-   `for...`, `<array>.each do ...`,`while...` and `until...` loops
-   `when ...` labels in case-statements
-   `rescue` labels in `begin ... rescue ...` blocks
-   everything counted for the "functions" metric

### functions

The "functions" metric counts:

-   method and function definitions: `def ...`
-   lambda functions: `->(x) { ... }`

### classes

The "classes" metric counts:

-   class definitions: `class ...`

### lines_of_code, comment_lines, real_lines_of_code and keywords_in_comments

see [README.md](../../README.md)
