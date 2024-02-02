<?php

/**
 * Complexity test resource file
 */

if ($x > $b) {
    if ($x > 100 && $x <= 122 || !$x) {
        $x = 2;
    } else if ($x > 122) {
        $x = 300;
    } else {
        $x = 1;
    }
    $x = 1;
}

$x = $x > 100 ? 101 : 99;

/*
    if ($not) {
    else if ($good) {
        echo "won't be counted! yippi!";
    }
 */

$x = $x + $y;

$z = $x > 0 ? $x : false;
$yz = $_GET['test'] ?? 'test_not_set';
