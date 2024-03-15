#!/usr/bin/perl
use strict;
use warnings;

sub new {
    my $class = shift;
    my $self = { i => 1 };
    bless $self, $class;
    return $self;
}

1;
