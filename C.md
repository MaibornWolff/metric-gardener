# File Metrics for C

This document provides language-specific details about the file metrics for the C programming language.

### complexity

The "complexity" metric counts:

-   `if` and `else if` statements
-   Uses of the conditional operator `condition ? then : otherwise`
-   Loops, including
    -   `for` loops
    -   `while` loops
    -   `do-while` loops
-   Logical binary operators `&&` and `||`
-   `case` labels in switch-statements
-   Structured Exception Handling (SEH) `__except` clauses
-   Function declarations, exactly like they are considered for the ["functions" metric](#functions)

It does **not** count:

-   Any function calls
-   Any preprocessor directives, including `#if`, `#ifdef` and `#elif`
-   Bitwise binary operators, like `^`, `&`, `|`, `&=` or `|=`

### functions

The "functions" metric counts function declarations in both header and source files. This also includes the definition of functions in source or header files that were already declared before.

### classes

The "classes" metric counts:

-   struct declarations
-   union declarations
-   enum declarations

It also considers declarations that are inside a `typedef`, like `typedef struct { int a; } alias_name;`

It does **not** count:

-   forward declarations of structs and unions (with semicolon directly after the class/struct/enum name instead of a code block, like `struct name;`).
-   General type definitions via `typedef`

### lines_of_code, comment_lines and real_lines_of_code

There are no language-specific details for these metrics. See [README.md](README.md) for their general definition.
