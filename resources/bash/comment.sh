#!/bin/bash

#only comments
x=3
#comment
if (($de -a $en)); then #comment
echo "helo" #comment
fi #comment
: '
This is a multiline comment.
Its created by using the colon (:) as a no-op command,
followed by a block enclosed in single quotes.
This block is treated as a string literal and is ignored.
' #comment

: <<'END_COMMENT' #comment
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
END_COMMENT #comment