#!/usr/bin/perl
use strict;
use warnings;

package Module 2.2;

use Exporter "import";

our @EXPORT = "export";
our @EXPORT_OK = qw(export_ok1 export_ok2);

sub export { print "export\n" }
sub export_ok1 { print "export_ok1\n" }
sub export_ok2 { print "export_ok2\n" }

1;
