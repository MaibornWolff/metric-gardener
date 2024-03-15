#!/usr/bin/perl
use strict;
use warnings;

# https://perldoc.perl.org/perlsyn#defer-blocks

use feature 'defer';
{
    print "defer 1";
    defer { print "defer 3"; }
    print "defer 2";
}
