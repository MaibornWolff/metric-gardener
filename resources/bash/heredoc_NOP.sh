#!/bin/bash
# This is a simple Bash script demonstrating user input, conditional statements, and arithmetic operations.

# Prompt the user to enter a number
echo "Enter a number:"
echo "Enter a number:" # This is an inline comment
# Multiline comment using the no-op command (:)
: '
This is a multiline comment.
Its created by using the colon (:) as a no-op (NOP) command,
followed by a block enclosed in single quotes.
This block is treated as a string literal and is ignored.
'
c=2 #comment
x=1

: <<'END_COMMENT'
This is a heredoc (<<) redirected to a NOP command (:).
The single quotes around END_COMMENT are important,
because it disables variable resolving and command resolving
within these lines.  Without the single-quotes around END_COMMENT,
the following two $() `` commands would get executed:
$(gibberish command)
`rm -fr mydir`

comment1
comment2
comment3
END_COMMENT