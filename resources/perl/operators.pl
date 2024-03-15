#!/usr/bin/perl
use strict;
use warnings;

# https://perldoc.perl.org/perlop

my $true = 1;
my $false = 0;

print "terms and list operators ", "1\n";
print("terms and list operators 2\n"), print("terms and list operators 3\n");

print("and " . ($true and $true) . "\n");
$true and print "and 2\n";
print("&& " . ($true && $true) . "\n");
$true && print("&& 2\n");
print("or " . ($true or $false) . "\n");
$false or print "or 2\n";
print("|| " . ($true || $false) . "\n");
$false || print "|| 2\n";
print("// " . ($ENV{undefined} // $true) . "\n");
$ENV{undefined} // print "// 2\n";

print("? " . ($true ? "1" : "2") . "\n");
$false? print "? 1\n" : print "? 2\n";
