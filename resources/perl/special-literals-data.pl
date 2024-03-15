#!/usr/bin/perl
use strict;
use warnings;

# https://perldoc.perl.org/perldata#Special-Literals

while (my $line = <DATA>) { print $line }
close DATA;

__DATA__
data
