import { MaxNestingLevel } from "./MaxNestingLevel";
import Parser from "tree-sitter";
import { Language, languageToGrammar } from "../helper/Language";
import { FileMetric, ParsedFile } from "./Metric";
import { ExpressionMetricMapping, NodeTypeCategory } from "../helper/Model";

describe("MaxNestingLevel.calculate(...)", () => {
    let maxNestingLevel: MaxNestingLevel;
    let parser: Parser;
    let tree: Parser.Tree;
    const nodeTypes: ExpressionMetricMapping[] = [
        {
            expression: "array",
            metrics: [],
            type: "statement",
            category: NodeTypeCategory.Nesting,
            languages: ["json"],
        },
        {
            expression: "object",
            metrics: [],
            type: "statement",
            category: NodeTypeCategory.Nesting,
            languages: ["json"],
        },
        {
            expression: "block_node",
            metrics: [],
            type: "statement",
            category: NodeTypeCategory.Nesting,
            languages: ["yaml"],
        },
    ];

    beforeAll(() => {
        maxNestingLevel = new MaxNestingLevel(nodeTypes);
        parser = new Parser();
    });

    it("should calculate maximum nesting level for a JSON file correctly", async () => {
        // given
        parser.setLanguage(languageToGrammar.get(Language.JSON));
        tree = parser.parse('{ "a": { "b": "c" } }');

        const parsedFile = new ParsedFile("test.json", Language.JSON, tree);

        // when
        const result = await maxNestingLevel.calculate(parsedFile);

        // then
        expect(result).toEqual({
            metricName: FileMetric.maxNestingLevel,
            metricValue: 1,
        });
    });

    it("should calculate maximum nesting level for a YAML file correctly", async () => {
        // given
        parser.setLanguage(languageToGrammar.get(Language.YAML));
        tree = parser.parse("on:\n  push:\n    branches:\n      - main");

        const parsedFile = new ParsedFile("test.yaml", Language.YAML, tree);

        // when
        const result = await maxNestingLevel.calculate(parsedFile);

        // then
        expect(result).toEqual({
            metricName: FileMetric.maxNestingLevel,
            metricValue: 3,
        });
    });

    it("should calculate nothing if the language does not contain a nesting node", async () => {
        // given
        parser.setLanguage(languageToGrammar.get(Language.Python));
        tree = parser.parse('{ "a": { "b": "c" } }');

        const parsedFile = new ParsedFile("test.py", Language.Python, tree);

        // when
        const result = await maxNestingLevel.calculate(parsedFile);

        // then
        expect(result).toEqual({
            metricName: FileMetric.maxNestingLevel,
            metricValue: 0,
        });
    });
});
