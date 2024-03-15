#!/usr/bin/perl
use strict;
use warnings;

# https://perldoc.perl.org/perlsyn#Loop-Control

my $i;

$i = 1;
while ($i <= 2) {
    print "next $i\n";
    next;
    ...;
} continue { $i++ }

$i = 1;
while () {
    print "last $i\n";
    last if $i >= 2;
} continue { $i++ }

$i = 1;
while ($i == 1) {
    print "redo " . $i++ . "\n";
    redo if $i <= 2;
} continue { print "redo 3\n" }
