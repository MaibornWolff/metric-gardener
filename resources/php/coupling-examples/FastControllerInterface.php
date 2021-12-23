<?php

namespace App;

interface FastControllerInterface extends ControllerInterface, AnotherControllerInterface {
    public function run();
}
