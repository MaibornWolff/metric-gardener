#!/bin/bash
counter=1
x=1
until ((counter > 5 && x == 1)); do
    echo "Iteration $counter"
    ((counter++))
done

input=""

until [ -n "$input" ]; do
    read -p "Enter a non-empty string: " input
done

source_file="/path/to/nonexistent_file.txt"
destination="/path/to/destination_directory"

until cp "$source_file" "$destination"; do
    echo "Copy failed. Retrying..."
    sleep 1
done
