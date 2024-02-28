#!/bin/bash

cat << EOF && echo "Here document executed successfully."
This is a multiline
text block using
a here document.

Result of arithmetic expansion: $((5 + 3))
More calculation $((5-2))
EOF

cat << 'EOF' && echo "Here document executed successfully." #ignore the arithmetic annotation
This is a multiline
text block using
a here document.

Result of arithmetic expansion: $((5 + 3))
More calculation $((5-2))
EOF