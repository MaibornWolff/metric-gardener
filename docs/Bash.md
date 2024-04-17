# File Metrics for Bash

This document outlines the definition of file metrics for Bash.

### complexity

The "complexity" metric counts:

-   `if` and `elif` statements
-   ternary operators: `<condition> ? x : y`
-   `for` loops : `for ...; do`
-   `while` loops: `while ...; do`
-   `until` loops: `until ...; do`
-   case item in case-statements, incl. default case item `*)`. A case item with multiple values counts only once.
      ```
      case $variable in
          <case item>)
          ;;
      ```
-   operators `&&` and `||` (except the ones placed after the first heredoc delimiter), used for:
    - concatenating function calls: `fun1 && fun2`
    - creating condition: `( <condition 1> && <condition 2>)`
-   everything counted for the "functions" metric

It does **not** count:

-   logical operators `-a` and `-o`
-   operators `&&` and `||` placed after the first heredoc delimiter, like: `cat << EOF && echo "Here document executed successfully."`

### functions

The "functions" metric counts:

-   function definitions:
  - `functionName(){...}`
  - `function functionName(){...}`

### classes

Bash doesn't have classes, so the value for this metric is always 0.

### lines_of_code, comment_lines, real_lines_of_code and keywords_in_comments

see [README.md](../README.md)
