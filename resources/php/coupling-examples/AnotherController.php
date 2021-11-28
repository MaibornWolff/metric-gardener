<?php

use App\CouplingExamples\Library\Helper as Helper;
use App\CouplingExamplesOne\BlubControllerOne1;
use App\ControllerInterface;
use App\FastControllerInterface;

namespace App\CouplingExamplesOne;

class AnotherControllerOne extends BlubControllerOne1 implements ControllerInterface, FastControllerInterface {
    public function run() {
        $this.executeHelper(new Helper());
    }
    private function executeHelper(Helper $helper) {
        $helper.help();
    }
}
