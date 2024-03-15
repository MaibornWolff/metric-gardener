#!/usr/bin/perl
use strict;
use warnings;

# https://perldoc.perl.org/perlsub#Autoloading

sub AUTOLOAD {
    our $AUTOLOAD; # keep 'use strict' happy
    print "autoload $AUTOLOAD @_\n";
}

undefined();
with_args(1, 2);

use subs qw(predeclared);
predeclared; # without parentheses
