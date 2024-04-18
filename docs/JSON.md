# File Metrics for JSON

This document outlines the definition of file metrics for JSON.

### max_nesting_level

The max_nesting_level metric quantifies the deepest level of nested brackets within a JSON file.
It considers both curly `{}` and square `[]` brackets.
Note that the outermost bracket is not included in the count.
So we have `max_nesting_level = 0` for the JSON example `{"property": "value"}` and empty files.

### lines_of_code

see [README.md](../README.md)
