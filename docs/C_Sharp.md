# File Metrics for C#

This document outlines the definition of file metrics for C#.

### complexity

The "complexity" metric counts:

-   `if` and `else if` statements
-   Uses of the ternary operator `condition ? then : otherwise`
-   Null-coalescing operators `??` and `??=`
-   Loops, including
    -   `for` loops and `foreach` loops
    -   `while` loops
    -   `do-while` loops
-   `case` labels in switch-statements
-   Not-default switch expression arms in switch expressions `x switch { value1 => expression1, ...}`
-   `catch` blocks
-   logical binary operations `&&` and `||`
-   pattern combinators `and` and `or` in `is`-expression, switch statements and switch expressions
-   everything counted for the ["functions" metric](#functions)

It does **not** count:

-   case guards with the keyword `when`
-   Default switch expression arms with syntax `_ => expression`
-   `goto` labels

### functions

The "functions" metric counts:

-   methods and the accessors `get`, `set` and `init` in classes, abstract classes, interfaces and
    records
-   constructors
-   lambda expressions

### classes

The "classes" metric counts:

-   definitions of `class`, `abstract class`, `interface`, `enum` and `record`

### lines_of_code, comment_lines and real_lines_of_code

see [README.md](../README.md)
