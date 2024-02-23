#!/bin/bash

cat << EOF && echo "Here document executed successfully."
This is a multiline
text block using
a here document.
Result of arithmetic expansion: $((5 + 3))
EOF