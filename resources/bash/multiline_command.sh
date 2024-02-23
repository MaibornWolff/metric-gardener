#!/bin/bash

fun1(){
echo "hello"
return 0
}

fun2(){
echo "Li"
return 0
}
fun1 \
  && \
  fun2

cat << EndOfText
This is line 1.
This is line 2.
This is line 3.
EndOfText