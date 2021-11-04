<?php

/**
 * McCabeComplexity test resource file
 */

namespace Declarations;

class FunctionsAndMethods {
    function __construct() {
    }

    public function testFunction1($x, $y): int {
        return 1;
    }

    private function testFunction2(): int {
        return 2;
    }

    public static function staticMethod() {}
}


function test() {}

function outOfScope(): int {
    return 3;
}