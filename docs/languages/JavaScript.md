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

-   static initialization blocks
-   function declarations and expressions with `function`,`function*`, `async function` and `async function*`
-   constructors, getter (`get <method_name>`), setter (`set <method_name>`), and methods of classes and objects
-   arrow functions

It does **not** count:

-   functions created from the constructors `new Function()`, `new GeneratorFunction()`, `new AsyncFunction()` and `new AsyncGeneratorFunction()`. Ex:
    ```
    const generator = new GeneratorFunction("a", "yield a * 2"); //we don't count this as function
    const iterator = generator(10);
    ```

### classes

The "classes" metric counts:

-   class definitions

### lines_of_code, comment_lines, real_lines_of_code and keywords_in_comments

see [README.md](../../README.md)
