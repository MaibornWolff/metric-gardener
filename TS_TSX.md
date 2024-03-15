# File Metrics for TypeScript (TS) and TypeScript JSX (TSX)

This document outlines the definition of file metrics for TypeScript (TS) and TypeScript JSX (TSX).

### 1. classes

The "classes" metric counts:

-   keywords like: `class`, `abstract class`, `interface`, `enum`
-   type aliases with object type literals e.g. `type ObjectType = { message: string};`

It does **not** count:

-   other type aliases like
    -   `type Union = {a: 1} & {b: 2};`
    -   `type Intersect = {a: 1} | {b: 2};`
    -   `type Tuple = [name: string, age: number];`
    -   `type AliasType = number;`

### 2. functions

The "functions" metric counts:

-   methods declarations in classes, abstract classes and interfaces
-   static methods, constructors, getters and setters
-   functions declared with the keyword `function`
-   arrow functions

### 3. complexity

The "complexity" metric counts:

-   `if`, `if else` statements, but **no** `else` statements
-   ternary expressions
-   for, while, do-while loops
-   `case` labels in switch-statements, but **no** `default` labels
-   `catch` labels in try-catch blocks, but **no** `finally` labels
-   binary operations `&&` and `||`
-   everything counted for "functions" metric

It does **not** count:

-   `.catch()` method call for Promises
-   `.forEach()` method call for iterables

### 4. lines_of_code and real_lines_of_code

see README.md
