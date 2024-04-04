<?php

class Test1 {}

class Test2 {}

class Test3 {}

abstract class AbstractClass {
    abstract protected function getValue();

    public function printOut() {
        print $this->getValue() . "\n";
    }
}

interface Template {
    public function setVariable($name, $var);
}

trait SayWorld {
    public function sayHello() {
        parent::sayHello();
        echo 'World!';
    }
}

var_dump(new class { // anonymous class
    public function log($msg) {
        echo $msg;
    }
});

enum Suit {
    case Hearts;
    case Diamonds;
    case Clubs;
    case Spades;
}
