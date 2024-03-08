import { getTestConfiguration } from "../../../test/metric-end-results/TestHelper";
import { formatPrintPath } from "./Helper";
import path from "path";

describe("Helper.ts", () => {
    describe("formatPrintPath(...)", () => {
        it("should change nothing when the config does not say otherwise", () => {
            const filePath = "/some/path/for/the/test.extension";
            const config = getTestConfiguration("/some/path");

            expect(formatPrintPath(filePath, config, path.posix)).toEqual(filePath);
        });

        it("should replace forward slashes when enforceBackwardSlash is set", () => {
            const filePath = "/some/path/for/the/test.extension";
            const config = getTestConfiguration("/some/path", { enforceBackwardSlash: true });

            expect(formatPrintPath(filePath, config, path.posix)).toEqual(
                "\\some\\path\\for\\the\\test.extension",
            );
        });

        it("should not replace backward slashes when enforceBackwardSlash is set", () => {
            const filePath = "C:\\Users\\user\\documents\\code\\file.extension";
            const config = getTestConfiguration("C:\\Users\\user\\documents\\code", {
                enforceBackwardSlash: true,
            });

            expect(formatPrintPath(filePath, config, path.win32)).toEqual(filePath);
        });

        it("should create UNIX-style relative paths when relativePaths is set", () => {
            const filePath = "/some/path/for/the/test.extension";
            const config = getTestConfiguration("/some/path", { relativePaths: true });

            expect(formatPrintPath(filePath, config, path.posix)).toEqual("for/the/test.extension");
        });

        it("should create DOS-style relative paths when relativePaths is set", () => {
            const filePath = "C:\\Users\\user\\documents\\code\\more-code\\file.extension";
            const config = getTestConfiguration("C:\\Users\\user\\documents\\code", {
                relativePaths: true,
            });

            expect(formatPrintPath(filePath, config, path.win32)).toEqual(
                "more-code\\file.extension",
            );
        });

        it("should return the file name if the file path equals the sources path when relativePaths is set (UNIX-style)", () => {
            const filePath = "/some/path/for/the/test.extension";
            const config = getTestConfiguration("/some/path/for/the/test.extension", {
                relativePaths: true,
            });

            expect(formatPrintPath(filePath, config, path.posix)).toEqual("test.extension");
        });

        it("should return the file name if the file path equals the sources path when relativePaths is set (DOS-style)", () => {
            const filePath = "C:\\Users\\user\\documents\\code\\more-code\\file.extension";
            const config = getTestConfiguration(
                "C:\\Users\\user\\documents\\code\\more-code\\file.extension",
                { relativePaths: true },
            );

            expect(formatPrintPath(filePath, config, path.win32)).toEqual("file.extension");
        });

        it("should both create relative paths and replace forward slashes in an UNIX-style path when both relativePaths and enforceBackwardSlash are set", () => {
            const filePath = "/some/path/for/the/test.extension";
            const config = getTestConfiguration("/some/path", {
                relativePaths: true,
                enforceBackwardSlash: true,
            });

            expect(formatPrintPath(filePath, config, path.posix)).toEqual(
                "for\\the\\test.extension",
            );
        });

        it("should only create relative paths for a DOS-style path when both relativePaths and enforceBackwardSlash are set", () => {
            const filePath = "C:\\Users\\user\\documents\\code\\more-code\\file.extension";
            const config = getTestConfiguration("C:\\Users\\user\\documents\\code", {
                relativePaths: true,
                enforceBackwardSlash: true,
            });

            expect(formatPrintPath(filePath, config, path.win32)).toEqual(
                "more-code\\file.extension",
            );
        });
    });
});
