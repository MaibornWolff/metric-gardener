#!/usr/bin/perl
use strict;
use warnings;

# https://perldoc.perl.org/functions/use

use lib 'resources/perl/modules';

use Module ();
Module::export;
Module::export_ok1;

use Module "export_ok1";
Module::export;
export_ok1;

use Module;
export;
export_ok1;
Module::export_ok2;

use Module 2.0;
use Module v2.1.3 ();
