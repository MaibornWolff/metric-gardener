#!/bin/bash

# Variables
name="Alice"
age=30
colors=("Red" "Green" "Blue")

# Function to greet the user
greet_user() {
    local user_name=$1
    echo "Hello, $user_name!" #comment
}

# Function to perform arithmetic calculations
perform_calculations() {
    local a=$1
    local b=$2 #comment
    result=$((a + b))
    echo "Result of $a + $b is: $result"
}

# Main function
main() {
    # Input
    read -p "Enter your favorite color: " favorite_color

    # Conditional statement with && and ||
    if [[ "$favorite_color" == "Blue" && $age -ge 18 ]]; then
        echo "You like Blue and are 18 or older."
    elif [[ "$favorite_color" == "Green" || $age -lt 18 ]]; then
        echo "You like Green or are younger than 18."
    else
        echo "Other conditions apply."
    fi

    # C-style expression for loop
    for ((i = 0; i < 5; i++)); do
        echo "C-style loop iteration: $i"
    done

    # Looping through colors array
    echo "Available colors:"
    for color in "${colors[@]}"; do
        echo "- $color"
    done

    # While loop with &&
    num=1
    [[ $num -le 3 && "$name" == "Alice" ]] && while [[ $num -le 3 ]]; do echo "Iteration $num" && ((num++)); done #comment

    # Function calls with ||
    greet_user "$name" || perform_calculations $((10 + 5)) $((3 * 4)) #comment

    # Command substitution with ||
    current_date=$(date +"%Y-%m-%d %H:%M:%S") || { echo "Failed to get the current date and time."; exit 1; }

    # Output redirection with &&
    echo "This is redirected" >output.txt && echo "Output file created."

    # Here document with &&
    cat <<EOF && echo "Here document executed successfully."
    This is a multiline
    text block using
    a here document.
    Result of arithmetic expansion: $((5 + 3))
EOF

    # Arithmetic expansion with ||
    result=$((5 * 3)) || echo "Arithmetic expansion failed."

}

# Call the main function
main
