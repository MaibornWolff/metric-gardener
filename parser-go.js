const Parser = require('tree-sitter');
const {Query, QueryCursor} = Parser
const GO = require('tree-sitter-go');

const parser = new Parser();
parser.setLanguage(GO);

const sourceCode = `
package main

import "fmt"

func notTheMain() {
}

func main() {

    if 7%2 == 0 {
        fmt.Println("7 is even")
    } else {
        fmt.Println("7 is odd")
    }

    if 8%4 == 0 {
        fmt.Println("8 is divisible by 4")
    }
    
    // go comment line 1
    // go comment line 2
    // go comment line 3
    
    /*
    go block comment line 1
    go block comment line 2
    go block comment line 3
    */
    
    

    if num := 9; num < 0 {  // inline comment goes here
        fmt.Println(num, "is negative")
    } else if num < 10 && num < 11 || num > 1000 {
        fmt.Println(num, "has 1 digit")
    } else {
        fmt.Println(num, "has multiple digits")
    }
    
    switch time.Now().Weekday() {
    case time.Saturday, time.Sunday:
        fmt.Println("It's the weekend")
    case time.Saturday, time.Sunday:
        fmt.Println("It's the weekend")
    default:
        fmt.Println("It's a weekday")
    }
    
    for num < 100 {
      num -= 1
    }
    
}
`;

const tree = parser.parse(sourceCode);

// more than one return statement within a function/method cannot be covered
//  elvis operator, ternary operator are not covered yet
// inline comments will decrease rloc which is not correct.
const metricsQuery = new Query(GO, `
  [
    "func"
    "if"
    "&&"
    "||"
    "for"
    "case"
    "goto"
  ] @keyword
  (comment) @comment
  (source_file) @program
  "func" @function
`);


const matches = metricsQuery.matches(tree.rootNode);
const caps = metricsQuery.captures(tree.rootNode);
console.log(caps)
const mccMatches = matches.filter((match) => { return match.pattern === 0 });

const commentLineMatches = matches.filter((match) => { return match.pattern === 1 });
const commentLines = commentLineMatches.reduce((accumulator, match) => {
    const captureNode = match.captures[0].node
    return accumulator + captureNode.endPosition.row - captureNode.startPosition.row + 1
}, 0);


const programMatches = matches.filter((match) => { return match.pattern === 2 });
const loc = programMatches.length > 0 ? programMatches[0].captures[0].node.endPosition.row : 0;

const functionMatches = matches.filter((match) => { return match.pattern === 3 });

console.log(tree.rootNode.toString());

console.log("\n\n#########################################################");
console.log("Metrics for the given php file:");
console.log("\tmcc:\t\t" + mccMatches.length);
console.log("\tcomment_lines:\t" + commentLines);
console.log("\tloc:\t\t" + loc);
console.log("\trloc:\t\t" + (loc - commentLines) );
console.log("\tfunctions:\t" + functionMatches.length);
console.log("\tclasses:\t" + " not implemented in go");
console.log("#########################################################\n\n");