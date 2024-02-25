#!/bin/bash

fun1(){
echo "hello" #inline comment
return 0
} #inline comment

fun2(){ #inline comment
echo "Li"
return 0
}
fun1 \
  && \
  fun2
