import { debuglog, type DebugLoggerFunction } from "node:util";
import { type QueryMatch } from "tree-sitter";
import { NodeTypeCategory, type NodeTypeConfig } from "../helper/Model.js";
import { QueryBuilder } from "../queries/QueryBuilder.js";
import {
    type QueryStatementInterface,
    SimpleLanguageSpecificQueryStatement,
} from "../queries/QueryStatements.js";
import { getQueryStatementsByCategories } from "../helper/Helper.js";
import { type MetricName, type Metric, type MetricResult, type ParsedFile } from "./Metric.js";

let dlog: DebugLoggerFunction = debuglog("metric-gardener", (logger) => {
    dlog = logger;
});

export class Classes implements Metric {
    private readonly statementsSuperSet: QueryStatementInterface[] = [];

    private readonly nodeTypeCategories = new Set([
        NodeTypeCategory.ClassDefinition,
        NodeTypeCategory.EnumDefinition,
        NodeTypeCategory.StructDefinition,
        NodeTypeCategory.RecordDefinition,
        NodeTypeCategory.UnionDefinition,
        NodeTypeCategory.TraitDefinition,
        NodeTypeCategory.InterfaceDefinition,
    ]);

    constructor(allNodeTypes: NodeTypeConfig[]) {
        this.statementsSuperSet = getQueryStatementsByCategories(
            allNodeTypes,
            ...this.nodeTypeCategories,
        );
        this.addQueriesForTSAndTSX();
        this.addQueriesForCAndCpp();
        this.addQueriesForJava();
        this.addQueriesForPHP();
    }

    addQueriesForCAndCpp(): void {
        this.statementsSuperSet.push(
            new SimpleLanguageSpecificQueryStatement(
                "(struct_specifier body: (field_declaration_list)) @struct_definition",
                ["cpp", "c"],
            ),
        );

        this.statementsSuperSet.push(
            new SimpleLanguageSpecificQueryStatement(
                "(union_specifier body: (field_declaration_list)) @union_definition",
                ["cpp", "c"],
            ),
        );

        this.statementsSuperSet.push(
            new SimpleLanguageSpecificQueryStatement(
                "(class_specifier body: (field_declaration_list)) @class_definition",
                ["cpp"],
            ),
        );

        this.statementsSuperSet.push(
            new SimpleLanguageSpecificQueryStatement(
                `(enum_specifier [
    base: (_)
    body: (enumerator_list)
]) @enum_with_body_or_type

(enum_specifier "enum"
    [
        "class"
        "struct"
    ]
    !base
    !body
) @scoped_enum_without_body_or_type
`,
                ["cpp"],
            ),
        );

        this.statementsSuperSet.push(
            new SimpleLanguageSpecificQueryStatement(
                "(enum_specifier body: (enumerator_list)) @enum_definition",
                ["c"],
            ),
        );
    }

    addQueriesForTSAndTSX(): void {
        this.statementsSuperSet.push(
            new SimpleLanguageSpecificQueryStatement(
                "(type_alias_declaration value: (object_type))",
                ["ts", "tsx"],
            ),
        );
    }

    addQueriesForJava(): void {
        this.statementsSuperSet.push(
            new SimpleLanguageSpecificQueryStatement("(object_creation_expression (class_body))", [
                "java",
            ]),
        );
    }

    addQueriesForPHP(): void {
        this.statementsSuperSet.push(
            new SimpleLanguageSpecificQueryStatement(`(object_creation_expression "new" "class")`, [
                "php",
            ]),
        );
    }

    calculate(parsedFile: ParsedFile): MetricResult {
        const { language, tree } = parsedFile;
        const queryBuilder = new QueryBuilder(language);
        queryBuilder.setStatements(this.statementsSuperSet);

        const query = queryBuilder.build();
        let matches: QueryMatch[] = [];
        if (query !== undefined) {
            matches = query.matches(tree.rootNode);
        }

        dlog(this.getName() + " - " + matches.length.toString());

        return {
            metricName: this.getName(),
            metricValue: matches.length,
        };
    }

    getName(): MetricName {
        return "classes";
    }
}
