#!/usr/bin/perl
use strict;
use warnings;

# https://perldoc.perl.org/perlclass

my $object;

use v5.38;
use feature 'class';

class Declaration;

class My::Example 1.234 {
    field $x;
    field $y = "y";
    field $z :param = "z";

    ADJUST {
        $x = "x";
    }

    method print_message {
        say "$x, $y, $z";
    }

    method print_message_param($param = "param") {
        say $param;
    }
}

class My::Subclass :isa(My::Example) {
    method subclass_method {
        say "subclass";
    }
}

$object = My::Example->new();
$object->print_message;
$object->print_message_param;
$object->print_message_param("PARAM");

My::Example->new(z => "ZZZ")->print_message;

$object = My::Subclass->new;
$object->print_message;
$object->subclass_method;
