<?php

namespace App\CouplingExamples\Library;

use App\CouplingExamplesOne\{
    BlubControllerOne1,
    BlubControllerOne2 as Blubber
};

use App\CouplingExamplesTwo\{
    BlubControllerTwo1
};

use System;
use System\Console\Writer as ConsoleWriter;

class Helper {
    public function help() {
        return "Helping";
    }
}
