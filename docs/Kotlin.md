# File Metrics for Kotlin

This document outlines the definition of file metrics for Kotlin.

### complexity

The "complexity" metric counts:

-   `if` and `else if` statements
-   `for`, `while` and `do...while` loops
-   branches (not `else` branch) in the `when` statements/expressions
-   `catch` labels in `try-catch` statements
-   logical binary operations `&&` and `||`
-   everything counted for the "functions" metric

It does **not** count:

-   `.forEach(...)` method call for iterables and other of built-in function calls

### functions

The "functions" metric counts:

-
-   lambda expressions and anonymous functions
-   `init` blocks
- secondary constructors

It does **not** count:
- primary constructor
-
### classes

The "classes" metric counts:

-   definitions of `class`, `abstract class`, `interface` (incl. `fun interface`), `enum` and `record`
-   anonymous classes

### lines_of_code, comment_lines, real_lines_of_code and keywords_in_comments

see [README.md](../README.md)
