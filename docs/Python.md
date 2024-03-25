# File Metrics for Python

This document outlines the definition of file metrics for Python.

### complexity

The "complexity" metric counts:

-   `if` and `elif` statements
-   ternary operators
-   `for`, `for...else`, `while` and `while...else` loops
-   `case` labels in match-statements and their guards, **but not** `case _:`
-   `except` clauses in `try`-statement
-   logical binary operations `and` and `or`
-   everything counted for the "functions" metric

It does **not** count:

-   function calls, e.g. `map()` built-in function

### functions

The "functions" metric counts:

-   general functions
-   method definitions in classes incl. static methods, class methods and constructors
-   lambda functions
-   initialization block (static and non-static)

It does **not** count:

-   functions definitions in `exec()` function calls

### classes

The "classes" metric counts:

-   class definitions using `class`-keyword

### lines_of_code, comment_lines and real_lines_of_code

see [README.md](../README.md)
