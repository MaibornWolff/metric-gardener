#!/usr/bin/perl
use strict;
use warnings;

eval { die };
print "after die\n";
eval { exit };
print "after exit\n";
