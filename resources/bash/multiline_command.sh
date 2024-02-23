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