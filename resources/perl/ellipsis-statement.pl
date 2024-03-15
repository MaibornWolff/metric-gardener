#!/usr/bin/perl
use strict;
use warnings;

# https://perldoc.perl.org/perlsyn#The-Ellipsis-Statement

use v5.12;
{ ... }
sub foo { ... }
...;
eval { ... };
sub somemeth {
    my $self = shift;
    ...;
}
my $x = do {
    my $n;
    ...;
    say "Hurrah!";
    $n;
};
