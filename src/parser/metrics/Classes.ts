import { QueryBuilder } from "../queries/QueryBuilder";
import { NodeTypeCategory, NodeTypeConfig } from "../helper/Model";
import { FileMetric, Metric, MetricResult, ParsedFile } from "./Metric";
import { debuglog, DebugLoggerFunction } from "node:util";
import { QueryMatch } from "tree-sitter";
import {
    QueryStatementInterface,
    SimpleLanguageSpecificQueryStatement,
} from "../queries/QueryStatements";
import { getQueryStatementsByCategories } from "../helper/Helper";

let dlog: DebugLoggerFunction = debuglog("metric-gardener", (logger) => {
    dlog = logger;
});

export class Classes implements Metric {
    private readonly statementsSuperSet: QueryStatementInterface[] = [];

    private nodeTypeCategories = new Set([
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

    addQueriesForCAndCpp() {
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

    addQueriesForTSAndTSX() {
        this.statementsSuperSet.push(
            new SimpleLanguageSpecificQueryStatement(
                "(type_alias_declaration value: (object_type))",
                ["ts", "tsx"],
            ),
        );
    }
    addQueriesForJava() {
        this.statementsSuperSet.push(
            new SimpleLanguageSpecificQueryStatement("(object_creation_expression (class_body))", [
                "java",
            ]),
        );
    }
    addQueriesForPHP() {
        this.statementsSuperSet.push(
            new SimpleLanguageSpecificQueryStatement(`(object_creation_expression "new" "class")`, [
                "php",
            ]),
        );
    }
    async calculate(parsedFile: ParsedFile): Promise<MetricResult> {
        const { language, tree } = parsedFile;
        const queryBuilder = new QueryBuilder(language);
        queryBuilder.setStatements(this.statementsSuperSet);

        const query = queryBuilder.build();
        let matches: QueryMatch[] = [];
        if (query !== undefined) {
            matches = query.matches(tree.rootNode);
        }

        dlog(this.getName() + " - " + matches.length);

        return {
            metricName: this.getName(),
            metricValue: matches.length,
        };
    }

    getName(): string {
        return FileMetric.classes;
    }
}
