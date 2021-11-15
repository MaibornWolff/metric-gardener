const Parser = require("tree-sitter");
const { Query } = Parser;
const PHP = require("tree-sitter-php");

const parser = new Parser();
parser.setLanguage(PHP);

const sourceCode = getSourceCodePHP();
const tree = parser.parse(sourceCode);

//  elvis operator are not covered yet
let metricsQuery = new Query(
    PHP,
    `
  [
    "function"
    "if"
    "&&"
    "||"
    "for"
    "foreach"
    "while"
    "case"
    "throw"
    "catch"
    "goto"
  ] @keyword
  (conditional_expression) @ternary_operator
  (comment) @comment
  (program) @program
  "function" @function
  "class" @class
`
);

function formatCaptures(tree, captures) {
  return captures.map((c) => {
    const node = c.node;
    delete c.node;
    c.text = tree.getText(node);
    return c;
  });
}

const matches = metricsQuery.matches(tree.rootNode);
const captures = metricsQuery.captures(tree.rootNode);

const importMatches = matches.filter((match) => {
    return match.pattern === 0;
});
console.log(importMatches, formatCaptures(tree, captures))


const mccMatches = matches.filter((match) => {
    return match.pattern === 0 || match.pattern === 1;
});

const commentLineMatches = matches.filter((match) => {
    return match.pattern === 2;
});
const commentLines = commentLineMatches.reduce((accumulator, match) => {
    const captureNode = match.captures[0].node;
    return accumulator + captureNode.endPosition.row - captureNode.startPosition.row + 1;
}, 0);

const programMatches = matches.filter((match) => {
    return match.pattern === 3;
});
const loc = programMatches.length > 0 ? programMatches[0].captures[0].node.endPosition.row : 0;

const functionMatches = matches.filter((match) => {
    return match.pattern === 4;
});
const classMatches = matches.filter((match) => {
    return match.pattern === 5;
});

console.log("\n\n#########################################################");
console.log("Metrics for the given php file:");
console.log("\tmcc:\t\t" + (mccMatches.length + getReturnStatementComplexity(tree)));
console.log("\tcomment_lines:\t" + commentLines);
console.log("\tloc:\t\t" + loc);
console.log("\trloc:\t\t" + (loc - commentLines));
console.log("\tfunctions:\t" + functionMatches.length);
console.log("\tclasses:\t" + classMatches.length);
console.log("#########################################################\n\n");

function getReturnStatementComplexity(tree) {
    let functionsAndMethodsQuery = new Query(
        PHP,
        `
    (method_declaration) @method
    (function_definition) @function
  `
    );

    const returnStatementQuery = new Query(
        PHP,
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

function getSourceCodePHP() {
    return `
    <?php
    use Dieter\\Hans\\Ruediger\\VV as VV;
    
    namespace This\\Is\\My\\Namespace\\Horst\\VV;
    
    function test() {
        return "blub";
    }
    
    class Blub {
        public function blub(VV $x, $y) {
            if ($x > $b) {
                if ($x > 100 && $x <= 122 || !$x) {
                    return 2;
                } else if ($x > 122) {
                    return 4;
                }
                return 1;
            }
            foreach ($x as $v) {
                echo "blub";
            }
            while (true) {
                print_r(true);
            } 
            switch ($x) {
                case 1:
                    print_r(2);
                case 3:
                    print_r(4);    
            }
            // Horst
            
            // Another cmnt
    
            /*
                if ($x) { print_r("blub"); }
                // nested commente
            */ 
    
            try {
                $x = $x > 100 ? 101 : 99;
            } catch (\\Exception $exc) {
              throw new Exception("some rewritten error");
            }
    
            /*
                if ($not) {
                else if ($good) {
                    echo "won't be counted! yippi!";
                }
             */
    
            do {
              echo "hello";
            } while(true);
            
            return $x + $y;
        }
        private function blub2() {
        return "horst";
        }
    }
    
    (new Blub()).blub(1,2);
    `;
}
