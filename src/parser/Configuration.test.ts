import { Configuration } from "./Configuration";

describe("Configuration", () => {
    describe("the constructor", () => {
        it("should work correctly when multiple exclusions are given", () => {
            const config = new Configuration(
                "sourcesPath",
                "output/path",
                false,
                "folder1 , folder2",
                false,
                "",
                false,
                false,
            );

            expect(config.exclusions.size).toBe(2);
            expect(config.exclusions.has("folder1")).toBe(true);
            expect(config.exclusions.has("folder2")).toBe(true);

            expect(config.parseAllAsC).toBe(false);
            expect(config.parseSomeAsC.size).toBe(0);
        });

        it("should work correctly when one exclusion is given", () => {
            const config = new Configuration(
                "sourcesPath",
                "output/path",
                false,
                "folder1",
                false,
                "",
                false,
                false,
            );

            expect(config.exclusions.size).toBe(1);
            expect(config.exclusions.has("folder1")).toBe(true);

            expect(config.parseAllAsC).toBe(false);
            expect(config.parseSomeAsC.size).toBe(0);
        });

        it("should work correctly when no exclusion is given", () => {
            const config = new Configuration(
                "sourcesPath",
                "output/path",
                false,
                "",
                false,
                "",
                false,
                false,
            );

            expect(config.exclusions.size).toBe(0);

            expect(config.parseAllAsC).toBe(false);
            expect(config.parseSomeAsC.size).toBe(0);
        });

        it("should work correctly when some .h files should be parsed as C", () => {
            const config = new Configuration(
                "sourcesPath",
                "output/path",
                false,
                "",
                false,
                "folder1, folder2",
                false,
                false,
            );

            expect(config.exclusions.size).toBe(0);

            expect(config.parseAllAsC).toBe(false);
            expect(config.parseSomeAsC.size).toBe(2);
            expect(config.parseSomeAsC.has("folder1")).toBe(true);
            expect(config.parseSomeAsC.has("folder2")).toBe(true);
        });

        it("should ignore when some .h files are specified to be parsed as C when all .h files should be parsed as C", () => {
            const config = new Configuration(
                "sourcesPath",
                "output/path",
                false,
                "",
                true,
                "folder1, folder2",
                false,
                false,
            );

            expect(config.exclusions.size).toBe(0);

            expect(config.parseAllAsC).toBe(true);
            expect(config.exclusions.size).toBe(0);
            expect(config.parseSomeAsC.size).toBe(0);
        });
    });
});
