# File Metrics for YAML

This document outlines the definition of file metrics for YAML.

### max_nesting_level

The max_nesting_level metric quantifies the deepest level of array (annotated with `-`, not `[...]`) and object nesting within a YAML file.

Examples: max_nesting_level is:
- `0` for `name: "yaml"` and empty files.
- `2` for
    ```
    name:
        - firstname: "Hans"
    ```
- `0` for
    ```
    name: |
        firstname
        lastname
    ```
### lines_of_code

see [README.md](../../README.md)
