<?php

class Test1 {}

class Test2 {}

class Test3 {}

abstract class AbstractClass {
    abstract protected function getValue(); //complexity +1

    public function printOut() { //complexity +1
        print $this->getValue() . "\n";
    }
}

interface Template {
    public function setVariable($name, $var); //complexity +1
}

trait SayWorld {
    public function sayHello() { //complexity +1
        parent::sayHello();
        echo 'World!';
    }
}

var_dump(new class { // anonymous class
    public function log($msg) { //complexity +1
        echo $msg;
    }
});

enum Suit {
    case Hearts;
    case Diamonds;
    case Clubs;
    case Spades;
}
