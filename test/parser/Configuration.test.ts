import { Configuration } from "../../src/parser/Configuration";

describe("Configuration", () => {
    describe("initializes settings", () => {
        it("when multiple exclusions are given", () => {
            const config = new Configuration(
                "sourcesPath",
                "output/path",
                false,
                "folder1 , folder2",
                false,
                false
            );

            expect(config.exclusions.length).toBe(2);
            expect(config.exclusions[0]).toBe("folder1");
            expect(config.exclusions[1]).toBe("folder2");
        });
        it("when one exclusion is given", () => {
            const config = new Configuration(
                "sourcesPath",
                "output/path",
                false,
                "folder1",
                false,
                false
            );

            expect(config.exclusions.length).toBe(1);
            expect(config.exclusions[0]).toBe("folder1");
        });
    });
});
