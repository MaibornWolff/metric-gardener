#!/bin/bash

count=4
result1=$(( $count > 3 && $count < 5))
result2=$(( $count < 3 || $count > 5))

if [ "$count" -gt 3  &&  "$count" -lt 5 ]; then
  echo "4"
elif [ "$count" -gt 3  ||  "$count" -lt 5 ]; then
  echo "maybe 4"
else
  echo "no info"
fi

if [ "$count" -gt 3 ]  &&  [ "$count" -lt 5 ]; then
  echo "4"
elif [ "$count" -gt 3 ]  ||  [ "$count" -lt 5 ]; then
  echo "maybe 4"
else
  echo "no info"
fi

fun1(){
echo "hello"
return 0
}

fun2(){
echo "Li"
return 0
}
fun1 && fun2
fun1 && fun2 || fun1

cat << EOF && echo "Here document executed successfully." #syntax tree created is not correct
This is a file
EOF
