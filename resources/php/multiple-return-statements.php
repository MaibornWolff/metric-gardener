<?php

/**
 * Complexity test resource file
 */

namespace Declarations;

class MultipleReturnStatements {

    public function function_with_more_than_one_return($x, $y): int {
        if ($x) {
            return 2;
        }
        return 1;
    }

    private function function_with_only_one_return(): int {
        return 2;
    }
}