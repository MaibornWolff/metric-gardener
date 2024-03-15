#!/usr/bin/perl
use strict;
use warnings;

# https://perldoc.perl.org/functions/require

use lib 'resources/perl/modules';

require Foo::A;
fooA();

my $class = "Foo::B";
eval "require $class";
fooB();

require "Foo/C.pm";
fooC();
