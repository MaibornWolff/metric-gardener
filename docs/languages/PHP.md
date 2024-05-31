# File Metrics for PHP

This document outlines the definition of file metrics for PHP.

### complexity

The "complexity" metric counts:

-   `if` and `else if` statements
-   ternary operators and nullish coalescing operators
-   `for` and `foreach` loops
-   `while` and `do...while` loops
-   `case` labels in switch-statements
-   conditional expressions in `match` expressions
-   `catch` blocks
-   logical binary operations `&&`, `||` and `xor`
-   everything counted for the "functions" metric

It does **not** count:

-   `goto` statements
-   any function calls

### functions

The "functions" metric counts:

-   methods and functions in classes, abstract classes, interfaces, traits, enums (incl. constructors and destructors)
-   lambda functions
-   anonymous functions

### classes

The "classes" metric counts:

-   definitions of `class`, `abstract class`, `interface`, `trait` and `enum`
-   anonymous classes

### lines_of_code, comment_lines, real_lines_of_code and keywords_in_comments

see [README.md](../../README.md)
