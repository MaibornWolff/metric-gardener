#!/bin/bash

echo "Using for loop:"

for i in {1..5}; do
    echo "Iteration $i"
done

for ((i=1; i<=5; i++)); do #c-style bash
    echo "Iteration $i"
done

for i in {0..20..5}
do
  echo "Number: $i"
done

for i in 1 2 3 4 5; do
    echo "Iteration $i"
done
