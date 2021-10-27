const Parser = require('tree-sitter');
const {Query} = Parser
const Kotlin = require('tree-sitter-kotlin');

const parser = new Parser();
parser.setLanguage(Kotlin);

const sourceCode = `
package de.maibornwolff.codecharta.importer.sourcecodeparser

import org.sonar.api.internal.apachecommons.io.FilenameUtils
import java.io.File
import java.nio.file.Paths

class ProjectTraverser(var root: File, private val exclude: Array<String> = arrayOf()) {
    private var fileList: MutableList<File> = mutableListOf()
    private val analyzerFileLists: MutableMap<String, MutableList<String>>? = HashMap()

    fun traverse() {
        val excludePatterns = exclude.joinToString(separator = "|", prefix = "(", postfix = ")").toRegex()

        root.walk().forEach {
            val standardizedPath = "/" + getRelativeFileName(it.toString())
            if (it.isFile && !(exclude.isNotEmpty() && excludePatterns.containsMatchIn(standardizedPath))) {
                fileList.add(it)
            }
        }

        adjustRootFolderIfRootIsFile()
        assignFilesToAnalyzers()
    }

    private fun assignFilesToAnalyzers() {
        for (file in this.fileList) {
            val fileName = getRelativeFileName(file.toString())
            val fileExtension = FilenameUtils.getExtension(fileName)

            if (!this.analyzerFileLists!!.containsKey(fileExtension)) {
                val fileListForType: MutableList<String> = mutableListOf()
                fileListForType.add(fileName)
                this.analyzerFileLists[fileExtension] = fileListForType
            } else {
                this.analyzerFileLists[fileExtension]!!.add(fileName)
            }
        }
    }

    fun getFileListByExtension(type: String): List<String> {
        return if (this.analyzerFileLists!!.containsKey(type)) {
            this.analyzerFileLists[type] ?: listOf()
        } else {
            ArrayList()
        }
    }

    // TODO some todo text
    private fun getRelativeFileName(fileName: String): String {
        return root.toPath().toAbsolutePath()
            .relativize(Paths.get(fileName).toAbsolutePath())
            .toString()
            .replace('\\\\', '/')
    }

    private fun adjustRootFolderIfRootIsFile() {
        if (root.isFile) {
            root = root.absoluteFile.parentFile
        }
    }
}

`

const tree = parser.parse(sourceCode);

// more than one return statement within a function/method cannot be covered
//  case statements, elvis operator are not covered yet
let mccQuery = new Query(Kotlin, `
  [
    "fun"
    "if"
    "&&"
    "||"
    "for"
    "while"
    "throw"
    "catch"
  ] @keyword
  (comment) @comment
  (source_file) @program
  "fun" @function
  "class" @class
`);

const mccMatches = mccQuery.matches(tree.rootNode);
const mcc = mccMatches.filter((match) => { return match.pattern === 0 });

const commentLineMatches = mccMatches.filter((match) => { return match.pattern === 1 });
const commentLines = commentLineMatches.reduce((accumulator, match) => {
  const captureNode = match.captures[0].node
  return accumulator + captureNode.endPosition.row - captureNode.startPosition.row + 1
}, 0);


const programMatches = mccMatches.filter((match) => { return match.pattern === 2 });
const loc = programMatches.length > 0 ? programMatches[0].captures[0].node.endPosition.row : 0;

const functionMatches = mccMatches.filter((match) => { return match.pattern === 3 });
const classMatches = mccMatches.filter((match) => { return match.pattern === 4 });

console.log(tree.rootNode.toString());

console.log("\n\n#########################################################");
console.log("Metrics for the given php file:");
console.log("\tmcc:\t\t" + mcc.length);
console.log("\tcomment_lines:\t" + commentLines);
console.log("\tloc:\t\t" + loc);
console.log("\trloc:\t\t" + (loc - commentLines) );
console.log("\tfunctions:\t" + functionMatches.length);
console.log("\tclasses:\t" + classMatches.length);
console.log("#########################################################\n\n");