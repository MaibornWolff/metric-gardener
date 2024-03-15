#!/usr/bin/perl
use strict;
use warnings;

# https://perldoc.perl.org/perlootut

my $object;


package Class;

sub new {
    my $class = shift;
    my $self = {
        attribute => shift // "value\n",
    };
    bless $self, $class;
    return $self;
}

sub print_attribute {
    my $self = shift;
    print $self->{attribute};
}

sub DESTROY { print "DESTROY\n" }


package Subclass;

use parent -norequire, "Class";

sub attribute {
    my $self = shift;

    $self->{attribute} = shift if @_;

    return $self->{attribute};
}


package main;

$object = Class->new;
$object->print_attribute;

$object = Class->new("custom value\n");
$object->print_attribute;

$object = new Class "indirect object syntax\n";
print_attribute $object;

$object = Subclass->new;
print $object->attribute("subclass\n");
