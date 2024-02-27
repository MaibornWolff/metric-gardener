#!/bin/bash

# Function with no parameters
hello() { # +1 functions
  echo "Hello, world!"
}

oneliner () { echo "Command One"; hello; }

multiply () {
result=$(($1 * $2))
echo "The result of multiplication: $result"
} > output.txt

function fun1(){
  hello
  return 34
}

function fun2(){
  fun1
  echo $?  #<-- Outputs 34
}

function simple_outputs() {
    sum=$(($1+$2))
    echo $sum
}

sum=$(simple_outputs 1 2)
echo "Sum is $sum"

function fibonnaci_recursion() {
    argument=$1
    if [[ "$argument" -eq 0 ]] || [[ "$argument" -eq 1 ]]; then
        echo $argument
    else
        first=$(fibonnaci_recursion $(($argument-1)))
        second=$(fibonnaci_recursion $(($argument-2)))
        echo $(( $first + $second ))
    fi
}

multiply 5 6