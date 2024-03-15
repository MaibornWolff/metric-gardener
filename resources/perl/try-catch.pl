#!/usr/bin/perl
use strict;
use warnings;

# https://perldoc.perl.org/perlsyn#Try-Catch-Exception-Handling

eval {
    die "eval";
    1;
} or do {
    print "or do $@";
};

use v5.36;
try {
    die "try";
} catch ($e) {
    print "catch $e";
}
