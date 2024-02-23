#!/bin/bash
number=8
if [ $number -eq 0 ]
then
echo "You entered zero. Zero is an even number."
elif [ $(($number % 2)) -eq 0 ]
then
echo "You entered $number. It is an even number."
else
echo "You entered $number. It is an odd number."
fi

condition=false
if [ condition ]; then
  echo "Is true";
else
  echo "not true";
fi

if_fun(){
  if [$1 -gt 0]; then
  echo "greater";
  fi
  echo "end"
}

var=12
if [[ "$var" = *12* ]]; then
    echo "This is a string regular expression if comparison example"
fi

count=4
if (( $count > 3 && $count < 5)); then
echo "4"
fi
