import * as fs from "node:fs";
import schema from "./output-schema.json" with { type: "json" };

const outputFormatPath = "docs/output-format/";
const outputPath = outputFormatPath + "OutputFormat.md";

function generateMarkdown(schema: any): string {
    const dontEdit =
        "<!-- DON'T EDIT THIS FILE MANUALLY GENERATE IT WITH THE generate-output-format-markdown SCRIPT! -->";
    const disclaimer = "# THIS IS NOT YET IMPLEMENTED, but coming soon!"; // TODO: Remove this line when implemented
    const title = "# Output Format";
    const firstLine = `The output is a JSON object that is returned by the API. The schema of the JSON object is described below.`;
    const schemaFile =
        "The format of the output is defined as a [json schema file](output-schema.json).";
    const exampleFile = "An example file is shown [here](example-output.json).";
    const description = "## Schema:";
    const jsonSchema = parseJsonSchema(schema);

    return `${dontEdit}\n${disclaimer}\n${title}\n\n${firstLine}\n\n${schemaFile}\n\n${exampleFile}\n\n${description}\n${jsonSchema}`;
}

function parseJsonSchema(schema: any, indent = ""): string {
    let markdown = "";

    if (schema.type === "object") {
        if (schema.properties) {
            // eslint-disable-next-line @typescript-eslint/no-unsafe-argument
            for (const [key, value] of Object.entries(schema.properties)) {
                // @ts-expect-error @typescript-eslint/ban-ts-comment
                markdown += `${indent}- **${key}**: ${value.description}\n`;
                markdown += parseJsonSchema(value, indent + "    ");
            }
        }
    } else if (schema.type === "array") {
        markdown += parseJsonSchema(schema.items, indent);
    }

    if (schema.enum) {
        markdown += `${indent}Possible values: ${JSON.stringify(schema.enum)}\n\n`;
    }

    if (schema.additionalProperties) {
        markdown += parseJsonSchema(schema.additionalProperties, indent);
    }

    return markdown;
}

// Write the generated markdown to the output file
fs.writeFileSync(outputPath, generateMarkdown(schema), "utf8");
console.log(`Markdown documentation has been generated at: ${outputPath}`);
