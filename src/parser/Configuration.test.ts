import { describe, expect, it } from "vitest";
import { getTestConfiguration } from "../../test/metric-end-results/TestHelper.js";

describe("Configuration", () => {
    describe("the constructor", () => {
        it("should work correctly when multiple exclusions are given", () => {
            const config = getTestConfiguration("sourcesPath", { exclusions: "folder1 , folder2" });

            expect(config.exclusions.size).toBe(2);
            expect(config.exclusions.has("folder1")).toBe(true);
            expect(config.exclusions.has("folder2")).toBe(true);

            expect(config.parseAllHAsC).toBe(false);
            expect(config.parseSomeHAsC.size).toBe(0);
        });

        it("should work correctly when one exclusion is given", () => {
            const config = getTestConfiguration("sourcesPath", { exclusions: "folder1" });

            expect(config.exclusions.size).toBe(1);
            expect(config.exclusions.has("folder1")).toBe(true);

            expect(config.parseAllHAsC).toBe(false);
            expect(config.parseSomeHAsC.size).toBe(0);
        });

        it("should work correctly when no exclusion is given", () => {
            const config = getTestConfiguration("sourcesPath");

            expect(config.exclusions.size).toBe(0);

            expect(config.parseAllHAsC).toBe(false);
            expect(config.parseSomeHAsC.size).toBe(0);
        });

        it("should work correctly when some .h files should be parsed as C", () => {
            const config = getTestConfiguration("sourcesPath", {
                parseSomeHAsC: "folder1, folder2",
            });

            expect(config.exclusions.size).toBe(0);

            expect(config.parseAllHAsC).toBe(false);
            expect(config.parseSomeHAsC.size).toBe(2);
            expect(config.parseSomeHAsC.has("folder1")).toBe(true);
            expect(config.parseSomeHAsC.has("folder2")).toBe(true);
        });

        it("should work correctly when one .h file should be parsed as C", () => {
            const config = getTestConfiguration("sourcesPath", { parseSomeHAsC: "header.h" });

            expect(config.exclusions.size).toBe(0);

            expect(config.parseAllHAsC).toBe(false);
            expect(config.parseSomeHAsC.size).toBe(1);
            expect(config.parseSomeHAsC.has("header.h")).toBe(true);
            expect(config.parseSomeHAsC.has("folder1")).toBe(false);
        });

        it("should ignore when some .h files are specified to be parsed as C when all .h files should be parsed as C", () => {
            const config = getTestConfiguration("sourcesPath", {
                parseAllHAsC: true,
                parseSomeHAsC: "folder1, folder2",
            });

            expect(config.exclusions.size).toBe(0);

            expect(config.parseAllHAsC).toBe(true);
            expect(config.exclusions.size).toBe(0);
            expect(config.parseSomeHAsC.size).toBe(0);
        });

        it("should work correctly when exclusions are given and some .h files should be parsed as C", () => {
            const config = getTestConfiguration("sourcesPath", {
                exclusions: "folder1 , folder2",
                parseSomeHAsC: "folder3, folder4",
            });

            expect(config.exclusions.size).toBe(2);
            expect(config.exclusions.has("folder1")).toBe(true);
            expect(config.exclusions.has("folder2")).toBe(true);

            expect(config.parseAllHAsC).toBe(false);
            expect(config.parseSomeHAsC.size).toBe(2);
            expect(config.parseSomeHAsC.has("folder3")).toBe(true);
            expect(config.parseSomeHAsC.has("folder4")).toBe(true);
        });
    });
});
