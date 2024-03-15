#!/usr/bin/perl
use strict;
use warnings;

# unlike die, exit will not be caught by eval
eval { exit };
print "after exit\n";
