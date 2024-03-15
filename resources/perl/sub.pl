#!/usr/bin/perl
use strict;
use warnings;

# https://perldoc.perl.org/perlsub

use lib 'resources/perl';
use subhelper;
my $object;


sub declaration;
sub definition { ... }


sub print_sub;
print_sub;
sub print_sub { print "subroutine\n" }

sub print_proto($);
print_proto "subroutine with prototype\n";
sub print_proto($) { print shift }

$object = main->new;
sub print_attrs : lvalue;
$object->print_attrs = 2;
$object->print_attrs;
sub print_attrs() : lvalue {
    my $self = shift;
    print "subroutine with attributes $self->{i}\n";
    $self->{i};
}

$object = main->new;
sub print_proto_attrs($) : lvalue;
$object->print_proto_attrs("and prototype") = 2;
$object->print_proto_attrs("and prototype");
sub print_proto_attrs($) : lvalue {
    my $self = shift;
    my $proto = shift;
    print "subroutine with attributes $proto $self->{i}\n";
    $self->{i};
}


use feature 'signatures';

sub print_sig;
print_sig "subroutine with signature\n";
sub print_sig($message) { print $message }

$object = main->new;
sub print_sig_attrs : lvalue;
$object->print_sig_attrs("and attributes") = 2;
$object->print_sig_attrs("and attributes");
sub print_sig_attrs : lvalue ($self, $message) {
    print "subroutine with signature $message $self->{i}\n";
    $self->{i};
}

sub print_sig_proto;
print_sig_proto "subroutine with signature and prototype\n";
sub print_sig_proto :prototype($) ($message) { print $message }


print_proto("call with parenthesis\n");
print_proto "call without parenthesis\n";
&print_proto("circumvent prototypes\n", "ignored");
@_ = 'current @_ visible' . "\n";
&print_proto;
