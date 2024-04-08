import { beforeAll, describe, expect, it } from "vitest";
import { MaxNestingLevel } from "./MaxNestingLevel.js";
import Parser = require("tree-sitter");
import { Language, languageToGrammar } from "../helper/Language.js";
import { ParsedFile } from "./Metric.js";
import { NodeTypeConfig, NodeTypeCategory } from "../helper/Model.js";

describe("MaxNestingLevel.calculate(...)", () => {
    let maxNestingLevel: MaxNestingLevel;
    let parser: Parser;
    const nodeTypes: NodeTypeConfig[] = [
        {
            type_name: "array",
            category: NodeTypeCategory.Nesting,
            languages: ["json"],
        },
        {
            type_name: "object",
            category: NodeTypeCategory.Nesting,
            languages: ["json"],
        },
        {
            type_name: "block_node",
            category: NodeTypeCategory.Nesting,
            languages: ["yaml"],
        },
    ];

    beforeAll(() => {
        maxNestingLevel = new MaxNestingLevel(nodeTypes);
        parser = new Parser();
    });

    it("should calculate maximum nesting level for a JSON file correctly", () => {
        expectMaxNestingLevel('{ "a": { "b": "c" } }', Language.JSON, 1);
    });

    it("should calculate maximum nesting level for a YAML file correctly", () => {
        expectMaxNestingLevel("on:\n  push:\n    branches:\n      - main", Language.YAML, 3);
    });

    it("should calculate nothing if the language does not contain a nesting node", () => {
        expectMaxNestingLevel('{ "a": { "b": "c" } }', Language.Python, 0);
    });

    function expectMaxNestingLevel(input: string, language: Language, expected: number): void {
        parser.setLanguage(languageToGrammar.get(language));
        const tree = parser.parse(input);

        const parsedFile = new ParsedFile("filename", language, tree);

        expect(maxNestingLevel.calculate(parsedFile)).toEqual({
            metricName: "max_nesting_level",
            metricValue: expected,
        });
    }
});
