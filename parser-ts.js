const Parser = require("tree-sitter");
const { Query } = Parser;
const TypeScript = require("tree-sitter-typescript").typescript;
const fs = require("fs");

const parser = new Parser();
parser.setLanguage(TypeScript);

const sourceCode = getSourceCode();
const tree = parser.parse(sourceCode);

const metricsQuery = new Query(
    TypeScript,
    `
  [
    "if"
    "&&"
    "||"
    "??"
    "for"
    "do"
    "while"
    "case"
    "throw"
    "catch"
  ] @keyword
  (function) @function
  (function_declaration) @function
  (method_definition) @function.method
  (ternary_expression) @ternary_operator
  (comment) @comment
  (program) @program
  "class" @class
`
);

const caps = metricsQuery.captures(tree.rootNode);

const matches = metricsQuery.matches(tree.rootNode);
const mccMatches = matches.filter((match) => {
    return match.pattern <= 4;
});

const commentLineMatches = matches.filter((match) => {
    return match.pattern === 5;
});
const commentLines = commentLineMatches.reduce((accumulator, match) => {
    const captureNode = match.captures[0].node;
    return (
        accumulator +
        captureNode.endPosition.row -
        captureNode.startPosition.row +
        1
    );
}, 0);

const programMatches = matches.filter((match) => {
    return match.pattern === 6;
});
const loc =
    programMatches.length > 0
        ? programMatches[0].captures[0].node.endPosition.row
        : 0;

const functionMatches = matches.filter((match) => {
    return match.pattern === 1 || match.pattern === 2 || match.pattern === 3;
});
const classMatches = matches.filter((match) => {
    return match.pattern === 8;
});

console.log("\n\n#########################################################");
console.log("Metrics for the given php file:");
console.log(
    "\tmcc:\t\t" + (mccMatches.length + getReturnStatementComplexity(tree))
);
console.log("\tcomment_lines:\t" + commentLines);
console.log("\tloc:\t\t" + loc);
console.log("\trloc:\t\t" + (loc - commentLines));
console.log("\tfunctions:\t" + functionMatches.length);
console.log("\tclasses:\t" + classMatches.length);
console.log("#########################################################\n\n");

function getReturnStatementComplexity(tree) {
    let functionsAndMethodsQuery = new Query(
        TypeScript,
        `
    (function) @function
    (function_declaration) @function
    (method_definition) @method
  `
    );

    const returnStatementQuery = new Query(
        TypeScript,
        `
    (return_statement) @return
  `
    );

    let additionalReturnStatementComplexity = 0;

    const functionsOrMethods = functionsAndMethodsQuery.captures(tree.rootNode);

    for (const capture of functionsOrMethods) {
        const returnCaptures = returnStatementQuery.captures(capture.node);
        if (returnCaptures.length > 1) {
            additionalReturnStatementComplexity += returnCaptures.length - 1;
        }
    }

    return additionalReturnStatementComplexity;
}

function getSourceCode() {
    return fs.readFileSync("./resources/js-example-code.ts").toString();
}
