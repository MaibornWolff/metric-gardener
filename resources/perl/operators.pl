#!/usr/bin/perl
use strict;
use warnings;

# https://perldoc.perl.org/perlop

my $true = 1;
my $false = 0;

print "terms and list operators ", "1\n";
print("terms and list operators 2\n"), print("terms and list operators 3\n");

print("and " . ($true and $true) . "\n");
$true and print "and 2\n";
print("&& " . ($true && $true) . "\n");
$true && print("&& 2\n");
print("or " . ($true or $false) . "\n");
$false or print "or 2\n";
print("|| " . ($true || $false) . "\n");
$false || print "|| 2\n";
print("// " . ($ENV{undefined} // $true) . "\n");
$ENV{undefined} // print "// 2\n";

print("? " . ($true ? "1" : "2") . "\n");
$false? print "? 1\n" : print "? 2\n";


use feature 'bitwise';
my $i = 0;
my $x = "x";

++$i; $i++; # auto-increment
--$i; $i--; # auto-decrement

# exponentiation
2 ** 3;

# symbolic unary operators
!$true; not $true; # logical negation
-1; # arithmetic negation
+1; # no effect
~1; ~."abc"; # bitwise negation
\$i; # reference

# binding operators
"abc" =~ m/abc/; "abc" !~ m/abc/;

# multiplicative operators
2 * 3; # multiplication
2 / 3; # division
2 % 3; # modulo
2 x 3; # repetition

# additive operators
2 + 3; # addition
2 - 3; # subtraction
"abc" . "def"; # concatenation

# shift operators
2 << 3; 2 >> 3;

# relational operators
2 < 3; 2 > 3; 2 <= 3; 2 >= 3; # numeric comparison
"abc" lt "def"; "abc" gt "def"; "abc" le "def"; "abc" ge "def"; # string comparison

# equality operators
2 == 3; 2 != 3; 2 <=> 3; # numeric comparison
"abc" eq "def"; "abc" ne "def"; "abc" cmp "def"; # string comparison
use feature 'isa'; 2 isa 3; # class instance operator
2 ~~ 3; # smart match

# bitwise operators
2 & 3; "abc" &. "def"; # bitwise and
2 | 3; "abc" |. "def"; # bitwise or
2 ^ 3; "abc" ^. "def"; # bitwise exclusive or

# logical operators
$true && $true; $true and $true; # logical and
$true || $false; $true or $false; # logical or
$true xor $false; # binary exclusive or
$ENV{undefined} // "defined"; # logical defined-or

# range operators
1 .. 10; 1 ... 10;

# conditional operator
$true ? "1" : "2";

# assignment operators
$i = 1;
$i **= 1;
$i += 1; $i -= 1; $x .= "y";
$i *= 1; $i /= 1; $i %= 1; $i x= 1;
$i &= 1; $i |= 1; $i ^= 1;
$x &.= "y"; $x |.= "y"; $x ^.= "y";
$i <<= 1; $i >>= 1;
$true &&= $true; $true ||= $false; $ENV{undefined} //= "defined";

# comma operator
2, 3; 2 => 3;
