#!/usr/bin/perl
use strict;
use warnings;

# https://perldoc.perl.org/perlsub

use lib 'resources/perl';
use subhelper;
my $object;

my $subref;

$subref = sub { print "anonymous\n" };
$subref->();

$subref = sub ($) { print shift };
$subref->("anonymous with prototype\n");

$object = main->new;
$subref = sub : lvalue {
    my $self = shift;
    print "anonymous with attributes $self->{i}\n";
    $self->{i};
};
$object->$subref() = 2;
$object->$subref();

$object = main->new;
$subref = sub ($) : lvalue {
    my $self = shift;
    my $proto = shift;
    print "subroutine with attributes $proto $self->{i}\n";
    $self->{i};
};
$object->$subref("and prototype") = 2;
$object->$subref("and prototype");


use feature 'signatures';

$subref = sub ($message) { print $message };
$subref->("anonymous with signature and prototype\n");

$object = main->new;
$subref = sub : lvalue ($self, $message) {
    print "anonymous with signature $message $self->{i}\n";
    $self->{i};
};
$object->$subref("and attributes") = 2;
$object->$subref("and attributes");
