<?php
$food = 'cake';

$return_value = match ($food) {
    'apple' => 'This food is an apple',
    'bar', 'dog' => 'This food is a bar',
    'cake' => 'This food is a cake',
    default => 'default value',
};

var_dump($return_value);
?>
