#!/usr/bin/perl
use strict;
use warnings;

# https://perldoc.perl.org/perlsyn#Compound-Statements

my $true = 1;
my $false = 0;
my $i;

if ($true) { print "if\n" }
if ($false) { print "if\n" } else { print "if else\n" }
if ($false) { print "if\n" } elsif ($true) { print "if elsif\n" }
if ($false) { print "if\n" } elsif ($false) { print "if elsif\n" } else { print "if elsif else\n" }

unless ($false) { print "unless\n" }
unless ($true) { print "unless\n" } else { print "unless else\n" }
unless ($true) { print "unless\n" } elsif ($true) { print "unless elsif\n" }
unless ($true) { print "unless\n" } elsif ($false) { print "unless elsif\n" } else { print "unless elsif else\n" }

use v5.10.1;
given ($true) { when (1) { print "given\n"} }

$i = 1;
while ($i <= 2) { print "while " . $i++ . "\n"}
$i = 1;
while ($i <= 2) { print "while continue $i\n"} continue { $i++ }

$i = 1;
until ($i > 2) { print "until " . $i++ . "\n"}
$i = 1;
until ($i > 2) { print "until continue $i\n"} continue { $i++ }

for (my $j = 1; $j <= 2; $j++) { print "for $j\n"}
for my $j (1..2) { print "for list $j\n" }
for my $j (1..2) { print "" } continue { print "for list continue $j\n" }

foreach (my $j = 1; $j <= 2; $j++) { print "foreach $j\n"}
foreach my $j (1..2) { print "foreach list $j\n" }
foreach my $j (1..2) { print "" } continue { print "foreach list continue $j\n" }

{ print "block\n" }
{ print "" } continue { print "block continue\n" }

BEGIN { print "BEGIN\n" }
UNITCHECK { print "UNITCHECK\n" }
CHECK { print "CHECK\n" }
INIT { print "INIT\n" }
END { print "END\n" }
