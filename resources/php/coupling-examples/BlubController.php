<?php

use App\CouplingExamples\Library\Helper as Helper;

namespace App\CouplingExamplesOne;

class BlubControllerOne1 {
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

class BlubControllerTwo1 {
    public function run() {
        $this.executeHelper(new Helper());
    }
    private function executeHelper(Helper $helper) {
        $helper.help();
    }
}
