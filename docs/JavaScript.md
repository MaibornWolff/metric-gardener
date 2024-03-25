# File Metrics for JavaScript

This document outlines the definition of file metrics for JavaScript.

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

-   function declarations and expressions with `function`,`function*`, `async function` and `async function*`
-   constructors, getter (`get <method_name>`), setter (`set <method_name>`), and methods of classes and objects
-   arrow functions

It does **not** count:

-   functions created with the constructors: `Function()`, `GeneratorFunction()`, `AsyncFunction()`, `AsyncGeneratorFunction()`

### classes

The "classes" metric counts:

-   class definitions

### lines_of_code, comment_lines and real_lines_of_code

see [README.md](../README.md)
