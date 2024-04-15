# File Metrics for Go

This document outlines the definition of file metrics for Go.

### complexity

The "complexity" metric counts:

-   `if` and `else if` statements
-   `for` loops with following syntaxes:
    -   `for <initStatement>; <condition>; <postStatement> {...}`
    -   `for <condition> {...}`
    -   `for <expressionList> = range <expression> {...}`
    -   `for <identifierList> := range <expression> {...}`
-   `case` labels in switch-statements and select-statements
-   logical binary operations `&&` and `||`
-   everything counted for the "functions" metric

### functions

The "functions" metric counts:

-   function and method declarations with keyword `func`

### classes

The "classes" metric counts:

-   `type` declarations (type alias included)

### lines_of_code, comment_lines, real_lines_of_code and keywords_in_comments

see [README.md](../README.md)
