<?php

use App\CouplingExamples\Library\Helper as Helper;
use App\ControllerInterface;

namespace App\CouplingExamplesOne;

class BlubControllerOne1 implements ControllerInterface {
    public function run() {
        $this.executeHelper(new Helper());
    }
    private function executeHelper(Helper $helper) {
        $helper.help();
    }
}

class BlubControllerOne2 {
    public function run() {
        $this.executeHelper(new Helper());
    }
    private function executeHelper(Helper $helper) {
        $helper.help();
    }
}


namespace App\CouplingExamplesTwo;

use App\CouplingExamplesOne\BlubControllerOne1;

class BlubControllerTwo1 extends BlubControllerOne1 {
    public function run() {
        $this.executeHelper(new Helper());
    }
    private function executeHelper(Helper $helper) {
        $helper.help();
    }
}
