#!/usr/bin/perl
use strict;
use warnings;

# https://perldoc.perl.org/perlsyn#PODs:-Embedded-Documentation

=head1 Here There Be Pods!

=item snazzle($)

The snazzle() function will behave in the most spectacular
form that you can possibly imagine, not even excepting
cybernetic pyrotechnics.

=cut back to the compiler, nuff of this pod stuff!

sub snazzle($) {
    my $thingie = shift;
    ...
}

my $a = "PODs\n";
=secret stuff
warn "Neither POD nor CODE!?"
=cut back
print $a;
