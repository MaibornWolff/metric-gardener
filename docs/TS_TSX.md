# File Metrics for TypeScript (TS) and TypeScript JSX (TSX)

This document outlines the definition of file metrics for TypeScript (TS) and TypeScript JSX (TSX).

### complexity

The "complexity" metric counts:

-   `if` and `else if` statements
-   ternary expressions and nullish coalescing operators
-   `for...of`, `for await...of`, `for...in`,`while` and `do...while` loops
-   `case` labels in switch-statements
-   `catch` blocks
-   logical binary operations `&&` and `||`
-   everything counted for the "functions" metric

It does **not** count:

-   `.catch()` method call for Promises
-   `.forEach()` method call for iterables and other built-in functions

### functions

The "functions" metric counts:

-   method declarations in classes, abstract classes and interfaces
-   static methods, constructors, getters and setters
-   functions declared with the keyword `function`
-   arrow functions

### classes

The "classes" metric counts:

-   declarations of classes, abstract classes, interfaces and enums
-   type aliases declaration with one single object type literal e.g. `type ObjectType = { message: string};`

It does **not** count:

-   other type aliases like
    -   `type Union = {a: 1} & {b: 2};`
    -   `type Intersect = {a: 1} | {b: 2};`
    -   `type Tuple = [name: string, age: number];`
    -   `type AliasType = number;`

### lines_of_code, comment_lines and real_lines_of_code

see [README.md](../README.md)
