<?php
use DieterUsed\Hans\Ruediger\VV as VV;

namespace This\Is\My\Namespace\Horst\VV;

function test() {
    return "blub";
}

class Blub {
    public function blub(VV $x, $y) {
        if ($x > $b) {
            if ($x > 100 && $x <= 122 || !$x) {
                return 2;
            } else if ($x > 122 && $x <= 123 && $x <= 124) {
                return 4;
            }
            return 1;
        }
        foreach ($x as $v) {
            echo "blub";
        }
        while (true) {
            print_r(true);
        }
        switch ($x) {
            case 1:
                print_r(2);
            case 3:
                print_r(4);
        }
        // Horst

        // Another cmnt

        /*
            if ($x) { print_r("blub"); }
            // nested commente
        */

        try {
            $x = $x > 100 ? 101 : 99;
        } catch (\Exception $exc) {
          throw new Exception("some rewritten error");
        }

        /*
            if ($not) {
            else if ($good) {
                echo "won't be counted! yippi!";
            }
         */

        do {
          echo "hello";
        } while(true);

        return $x + $y;
    }
    private function blub2() {
    return "horst";
    }
}

(new Blub()).blub(1,2);
