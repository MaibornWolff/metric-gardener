# File Metrics for Rust

This document outlines the definition of file metrics for Rust.

### complexity

The "complexity" metric counts:

-   `if` and `else if` statements
-   `for ...`, `while ...` and `loop {...}` loops
-   match arms in match-statements:
    ```
    match ... {
        <match arm value> => println!("Hello"),
        _ => println!("Hallo"),
    }
    ```
-   or patterns in match arm: `|`
-   logical binary operations `&&` and `||`
-   everything counted for the "functions" metric

### functions

The "functions" metric counts:

-   method and function definitions: `fn ...`

### classes

The "classes" metric counts:

-   struct and trait definitions: `struct ...`, `trait ...`

It does **not** count:

- implementations on types: `impl ...`

### lines_of_code, comment_lines, real_lines_of_code and keywords_in_comments

see [README.md](../README.md)
