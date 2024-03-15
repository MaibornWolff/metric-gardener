#!/usr/bin/perl
use strict;
use warnings;

# https://perldoc.perl.org/perlsyn#Switch-Statements

use v5.10.1;

for ("a") {
    when ("a") { print "for when\n" }
    when ("b") { die }
    default    { die }
}

foreach ("b") {
    when ("a") { die }
    when ("b") { print "foreach when\n" }
    default    { die }
}

given ("c") {
    when ("a") { die }
    when ("b") { die }
    default    { print "given default\n" }
}

given ("a") {
    when ("a") { print "continue 1\n"; continue }
    when ("b") { die }
    default    { print "continue 2\n"; continue }
    print "continue 3\n"
}

given ("b") {
    when ("a") { die }
    when ("b") { print "break\n"; break; die }
    default    { die }
}
