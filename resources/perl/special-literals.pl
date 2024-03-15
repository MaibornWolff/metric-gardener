#!/usr/bin/perl
use strict;
use warnings;

# https://perldoc.perl.org/perldata#Special-Literals

print "file: " . __FILE__ . "\n";
print "line: " . __LINE__ . "\n";
print "package: " . __PACKAGE__ . "\n";

sub SUB {
    use v5.16;
    print "sub: " . __SUB__ . "\n";
}
SUB;

print "end\n";
__END__
comment
