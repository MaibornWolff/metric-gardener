#!/usr/bin/perl
use strict;
use warnings;

# https://perldoc.perl.org/perlsyn#Goto

goto LABEL;
die; # never
LABEL: print "goto LABEL\n";

my $i = 1;
EXPR2: print "goto EXPR $i\n";
$i++;
goto "EXPR$i";
EXPR3: print "goto EXPR $i\n";

sub SUB1 { goto &SUB2 }
sub SUB2 { print "goto &NAME from ", (caller)[1], "\n" }
sub SUB3 { SUB2 }
SUB1;
SUB3;
