# File Metrics for TypeScript (TS) and TypeScript JSX (TSX)

This document outlines the definition of file metrics for TypeScript (TS) and TypeScript JSX (TSX). The identified file metrics include:

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

The "functions" metric counts :

-   methods declarations in classes and interface
-   static methods, constructors, getters and setters
-   the keyword `function`
-   arrow functions

It does **not** count:

-   getter and setter

to test: constructors, getter, setter
