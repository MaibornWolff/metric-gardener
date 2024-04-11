# File Metrics for Java

This document outlines the definition of file metrics for Java.

### complexity

The "complexity" metric counts:

-   `if` and `else if` statements
-   ternary operators
-   `for` loops with following syntaxes:
    -   `for (<initialization>; <termination>; <increment>) {...}`
    -   `for (<element> : <iterable>) {...}`
-   `while` and `do...while` loops
-   `case` labels in switch-statements
-   `catch` blocks
-   logical binary operations `&&` and `||`
-   everything counted for the "functions" metric

It does **not** count:

-   `.forEach(...)` method call for iterables and other of built-in function calls

### functions

The "functions" metric counts:

-   method declarations and definitions in classes, abstract classes and interfaces
-   static methods and constructors
-   lambda expressions
-   initialization block (static and non-static)

### classes

The "classes" metric counts:

-   definitions of `class`, `abstract class`, `interface`, `enum` and `record`
-   anonymous classes

### lines_of_code, comment_lines, real_lines_of_code and keywords_in_comments

see [README.md](../README.md)
