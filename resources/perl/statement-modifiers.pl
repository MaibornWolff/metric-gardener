#!/usr/bin/perl
use strict;
use warnings;

# https://perldoc.perl.org/perlsyn#Statement-Modifiers

my $true = 1;
my $false = 0;
my $i;

print "if\n" if $true;
print "unless\n" unless $false;

$i = 1;
print "while " . $i++ . "\n" while $i <= 2;
$i = 1;
print "until " . $i++ . "\n" until $i > 2;

print "for $_\n" for 1..2;
print "foreach $_\n" foreach 1..2;

use v5.14;
given ($true) {
    print "when\n" when 1;
}
