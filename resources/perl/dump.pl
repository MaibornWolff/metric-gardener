#!/usr/bin/perl
use strict;
use warnings;

# https://perldoc.perl.org/functions/dump

CORE::dump LABEL;
LABEL: print "after dump\n";
