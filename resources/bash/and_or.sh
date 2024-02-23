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