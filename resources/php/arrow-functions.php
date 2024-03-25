<?php

$num1 = fn(array $x) => $x; //functions +1
$num2 = static fn(): int => $x; //functions +1
$num3 = fn($x = 42) => $x; //functions +1
$num4 = fn(&$x) => $x; //functions +1
$num5 = fn&($x) => $x; //functions +1
$num6 = fn($x, ...$rest) => $rest; //functions +1

$z = 1;
$fn1 = fn($x) => fn($y) => $x * $y + $z; //functions +2
?>
