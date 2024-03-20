# File Metrics for C++

This document provides details about the file metrics for the C++ programming language.

### complexity

The "complexity" metric counts:

### functions

The "functions" metric counts function declarations in both header and source files. This also includes the definition of functions in source or header files that were already declared before. The metric is tested to account for:

-   general functions
-   member functions, including constructors, (pure) virtual functions, default functions and deleted functions
-   lambda expressions

### classes

The "classes" metric counts:

-   class declarations
-   struct declarations
-   union declarations
-   enum declarations (including scoped enums, unscoped enums and opaque enums)

It does **not** count:

-   forward declarations of classes, structs and unions (with semicolon directly after the class/struct/enum name instead of a code block).
-   typedefs
-

### lines_of_code, comment_lines and real_lines_of_code

see [README.md](README.md)
