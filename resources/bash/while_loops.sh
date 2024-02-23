#!/bin/bash

counter=1
while [ $counter -le 5 ]; do
    echo "Iteration $counter"
    ((counter++))
done

while ((counter <= 5)); do
    echo "Iteration $counter"
    ((counter++))
done

x=1
while ((counter <= 5 && x < 5)); do
    echo "Iteration $x"
    ((x++))
done
