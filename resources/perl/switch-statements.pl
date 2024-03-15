#!/usr/bin/perl
use strict;
use warnings;

# https://perldoc.perl.org/perlsyn#Switch-Statements

use v5.10.1;

for ("a") {
    when ("a") { print "for when\n" }
    when ("b") { ... }
    default    { ... }
}

foreach ("b") {
    when ("a") { ... }
    when ("b") { print "foreach when\n" }
    default    { ... }
}

given ("c") {
    when ("a") { ... }
    when ("b") { ... }
    default    { print "given default\n" }
}

given ("a") {
    when ("a") { print "continue 1\n"; continue }
    when ("b") { ... }
    default    { print "continue 2\n"; continue }
    print "continue 3\n"
}

given ("b") {
    when ("a") { ... }
    when ("b") { print "break\n"; break; ... }
    default    { ... }
}
