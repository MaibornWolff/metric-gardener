import { Configuration } from "./Configuration";

describe("Configuration", () => {
    describe("initializes settings", () => {
        it("when multiple exclusions are given", () => {
            const config = new Configuration(
                "sourcesPath",
                "output/path",
                false,
                "folder1 , folder2",
                false,
                false,
            );

            expect(config.exclusions.size).toBe(2);
            expect(config.exclusions.has("folder1")).toBe(true);
            expect(config.exclusions.has("folder2")).toBe(true);
        });
        it("when one exclusion is given", () => {
            const config = new Configuration(
                "sourcesPath",
                "output/path",
                false,
                "folder1",
                false,
                false,
            );

            expect(config.exclusions.size).toBe(1);
            expect(config.exclusions.has("folder1")).toBe(true);
        });
    });
});
