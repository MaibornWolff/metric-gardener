const Parser = require("tree-sitter");
const { Query } = Parser;
const CSharp = require("tree-sitter-c-sharp");

const parser = new Parser();
parser.setLanguage(CSharp);

const sourceCode = getSourceCode();

const tree = parser.parse(sourceCode);

//  elvis operator, ternary operator are not covered yet
// inline comments will decrease rloc which is not correct.
const metricsQuery = new Query(
    CSharp,
    `
        (qualified_name) @qualified_name
        (parameter) @parameter
        (member_access_expression) @member_access_expression
        (namespace_declaration name: (qualified_name) @namespace_declaration_name) @namespace_declaration
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


function getSourceCode() {
    return `
        using System;
    
        // this code won't work at all
        
        namespace Helper.NicerHelpers.NicestHelpers
        {
            public class TestHelper
            {
                private readonly TestFunction testFunction = new TestFunction();
        
                public void foo(MyOther.Nameingspacing.Helperings.Horst horst)
                {
                    Console.WriteLine("Hello World!");
                    
                    if ("foo" != "bar")
                    {
                        foreach (var eventHandler in eventHandlers)
                        {
                            eventHandler(this, EventArgs.Empty);
                        }
                    }
                }
        
                bool ITest.CanRun(object parameter)
                {
                    return _canRun;
                }
            }
        }
        `;
}
