import { describe, expect, it, vi } from "vitest";
import { updateNodeTypesMappingFile } from "./commands/import-grammars/ImportNodeTypes.js";
import { parser } from "./cli.js";
import { mockConsole } from "../test/metric-end-results/TestHelper.js";

vi.mock("./commands/import-grammars/ImportNodeTypes.js", () => ({
    updateNodeTypesMappingFile: vi.fn(),
}));

describe("cli", () => {
    itShouldOfferHelp();

    describe("import-grammars command", () => {
        itShouldOfferHelp("import-grammars");

        it("should call updateNodeTypesMappingFile()", async () => {
            parser.parse("import-grammars");
            expect(updateNodeTypesMappingFile).toHaveBeenCalled();
        });
    });
});

function itShouldOfferHelp(command = "") {
    it("should offer help", () => {
        mockConsole();
        parser.exitProcess(false).parse(`${command} --help`);
        expect(vi.mocked(console.log).mock.lastCall?.[0]).toMatchSnapshot();
    });
}
