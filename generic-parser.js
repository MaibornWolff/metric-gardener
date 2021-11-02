const GO = require("tree-sitter-go");
const Kotlin = require("tree-sitter-kotlin");
const PHP = require("tree-sitter-php");
const TypeScript = require("tree-sitter-typescript");
const fs = require("fs");

const mccKeywordsSuperSet = [
    // functions and methods
    "function",
    "func",
    "fun",

    // if statements and logical operators
    "if",
    "&&",
    "||",
    "??",

    // loops (do not count do and while together as +2)
    "for",
    "foreach",
    "do",
    "while",

    // misc
    "case",
    "throw",
    "catch",
    "goto",
];

const mccStatementsSuperSet = [
    "(function) @function",
    "(function_declaration) @function",
    "(function_definition) @function",
    "(method_definition) @function.method",
    "(method_declaration) @function.method",
    "(ternary_expression) @ternary_operator",
    "(conditional_expression) @ternary_operator",
];

const language = "TypeScript";

export const Grammars = new Map([
    ["GO", GO],
    ["Kotlin", Kotlin],
    ["PHP", PHP],
    ["TypeScript", TypeScript.typescript],
]);

const filesToParse = new Map([
    ["GO", "./resources/go-example-code.go"],
    ["Kotlin", "./resources/kotlin-example-code.kt"],
    ["PHP", "./resources/php-example-code.php"],
    ["TypeScript", "./resources/js-example-code.ts"],
]);

if (!grammars.has(language)) {
    throw new Error(
        "Language " +
            language +
            " not supported! Supported ones are: " +
            [...grammars.keys()].join(", ")
    );
}

const Parser = require("tree-sitter");
const { Query } = Parser;

for (const [fileLanguage, filePath] of filesToParse.entries()) {
    const exampleCode = fs.readFileSync(filePath).toString();

    const parser = new Parser();
    const treeSitterLanguage = grammars.get(fileLanguage);
    parser.setLanguage(treeSitterLanguage);

    const tree = parser.parse(exampleCode);

    const availableMccKeywords = [];

    for (const mccKeyword of mccKeywordsSuperSet) {
        try {
            const metricsQuery = new Query(
                treeSitterLanguage,
                `
              [
                "` +
                    mccKeyword +
                    `"
              ] @keyword
            `
            );

            const matches = metricsQuery.matches(tree.rootNode);

            availableMccKeywords.push(mccKeyword);
        } catch (e) {
            console.log(mccKeyword + " not available");
        }
    }

    console.log("\n\n");
    console.log("Found keywords for " + fileLanguage + ":");
    console.log(availableMccKeywords, "\n\n");

    const availableMccStatements = [];

    for (const mccStatement of mccStatementsSuperSet) {
        try {
            const metricsQuery = new Query(treeSitterLanguage, mccStatement);
            const matches = metricsQuery.matches(tree.rootNode);
            availableMccStatements.push(mccStatement);
        } catch (e) {
            console.log(mccStatement + " not available");
        }
    }

    console.log("\n\n");
    console.log("Found statements for " + fileLanguage + ":");
    console.log(availableMccStatements, "\n\n");

    const mccQuery = new Query(
        treeSitterLanguage,
        '["' +
            availableMccKeywords.join('""') +
            '"] @keyword \n' +
            availableMccStatements.join("\n")
    );
    const mccMatches = mccQuery.matches(tree.rootNode);

    console.log("### MCC for " + fileLanguage + ": ###");
    console.log("### " + mccMatches.length + " ###");
    console.log("\n\n");
}
