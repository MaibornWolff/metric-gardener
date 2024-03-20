# File Metrics for C++

This document outlines the definition of file metrics for C++.

### complexity

The "complexity" metric counts:

-   `if` and `else if` statements
-   ternary expressions
-   `for` loops with following syntaxes:
    -   `for (type variableName : arrayName) {...}`
    -   `for (statement 1; statement 2; statement 3) {...}`
-   `while` and `do...while` loops
-   `case` labels in switch-statements
-   `catch` blocks and `except` clauses in Structured Exception Handling (SEH)
-   logical binary operations `&&` and `||` as well as their alternative spellings `and` and `or`
-   everything counted for the "functions" metric

It does **not** count:

-   preprocessor directives like `#if`, `#ifdef` or `#ifndef`
-   `for-each`, `copy_if` function calls from the Standard Template Libraries or other built-in functions

### functions

The "functions" metric counts:

-   method declarations and definitions in `class`, `struct` and `union`
-   constructors and destructors in `class`, `struct` and `union`
-   lambda functions

### classes

The "classes" metric counts:

-   definitions of `class`, `struct` and `union`
-   enums (`enum`,`enum class` and `enum struct`) and also opaque enums
-   `typedef` usages, which contain implementation {...}:
    -   `typedef struct {...} alias_name`
    -   `typedef union {...} alias_name`
    -   `typedef enum {...} alias_name`

It does **not** count:

-   forward declarations of `class`,`struct` and `union`
-   other usages of `typedef` not listed above

### lines_of_code, comment_lines and real_lines_of_code

see [README.md](README.md)
