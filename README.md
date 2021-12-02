## This is a node based parser to calculate metrics

### Supported Languages

-   C# (no unit tests -> not stable)
-   Java (no unit tests -> not stable)
-   JavaScript (no unit tests -> not stable)
-   Kotlin (no unit tests-> not stable)

-   Go (incompletely unit tested -> not stable)

-   PHP (all metrics unit tested -> stable)
-   TypeScript (all metrics unit tested -> stable)

### Supported Metrics (stable and unit tested)

-   mcc
-   functions
-   classes

### Unstable Metrics (not unit tested)

-   lines_of_code
-   comment_lines
-   real_lines_of_code

### Usage

For object-oriented metrics setup neo4j DB first:

-   `cd projects/node-parser/; docker run --publish=7474:7474 --publish=7687:7687 --volume=${PWD}/neo4j/data:/data neo4j --env=NEO4J_AUTH=none`

Then parse your sources:

-   `npm install`
-   `npm run start -- parse /path/to/sources -o /output/file/path.json` specify the path to a folder or a file to be parsed and specify output file path.
-   `npm run start -- import-grammars` (re-)import grammar expression types for supported languages from tree-sitter grammar npm packages.
    This will have no effect until you have mapped the changed and new expressions manually to ./resources/node-types-mapped.config

# Dependency Graph Exploration with Neo4J:

-   Be sure a local Neo4j server is running under neo4j://localhost:7687
-   You can simply run a Neo4j docker container:
    -   Windows:`docker run --publish=7474:7474 --publish=7687:7687 --volume=${PWD}/neo4j/data:/data neo4j`
    -   Unix: `docker run --publish=7474:7474 --publish=7687:7687 --volume=$(pwd)/neo4j/data:/data neo4j`
-   Run parser with activated dependency parsing passing `--parse-dependencies` option
-   Then, visit `http://localhost:7474/` with `admin/admin` or view coupling data in generated output file

### TODOs

For Publish 0.1.0:

-   Provide more command line options
-   Performance & Duplicate Adds (see TODO comments)
-   Handle multiple file extensions during parsing on the fly
-   Fix Unit Tests
-   README Update
-   CSharp finalization? (havy candidate building not implemented yet)
-   Typescript coupling graph?

-   npm publish / github repo

Priority second:

-   Refactor Abstract Usage Collector (small resolver classes?)
-   Exclude System Namespaces like System in CSharp etc. (Configurable option would also be nice (e.g. exclude NameSpace _UnitTest_))
-   Checkout sample project(s) per language and parse them as an automatically test
-   ProgressBar
-   Output calculated metrics in a file/json
-   Separate Infrastructure from Domain Code
-   Write command to add new language and map expressions
-   Write command to generate/import specified node-types.json files
-   Support more languages
-   Add more Unit Tests

### Proof of concept for object-oriented-metrics

-   WMC: Weighted Methods per Class entspricht der Anzahl aller Komplexitäten aller Methoden einer Klasse.
    entspricht Zyklomatischer Komplexität einer Klasse

-   Hybrid Approach: Graph mit Classes als Nodes, Edges als Coupling Info und ParseTree als Metadata pro Node.

-   CBO: Coupling between Objects ist gleich der Anzahl der mit der betrachteten Klasse gekoppelten Klasse(n).
-   Coupling - Call Graph? Vermutlich möglich - Hybrid Approach: yes - MATCH (n:Class)-[r:USES]-() RETURN n, COUNT(r)

-   RFC: Response for class ist die Anzahl aller möglichen auszuführenden Methoden:

    -   Call Graph? was ist mit extends? Parent classes werden auch in Sonar nicht berücksichtigt.
    -   Hybrid Approach: pro gekoppelter Klasse (und self) public und static Methoden counten

-   LCOM4: Would need a Call Graph (count of transitiv cohesive call paths) - Call Graph
-   LCOM: Lack of Cohesion ist gleich der Paare von Methoden ohne gemeinsame Instanzvariablen.
    Abzüglich der Paare von Methoden mit gm. Instv. - als normale Metrik möglich: Query mit (classes -> functions/methods) und dann Brute Force - Brute Force oder vermutlich auch über Call Graph möglich - Hybrid Approach: nein außer man nutzt den vorberechneten Parsetree pro Klasse, um die Methoden zu querien. - dann müsste man aber wieder pro Methode Queries abschicken, um deren Calls und Property uses zu finden. - das müsste man dann noch mal kombinatorisch auflösen, um zu wissen, ob Kohäsion vorliegt oder nicht (bruteforce like)

-   DIT: Depth of Inheritance Tree ist die maximale Pfadlänge von der Wurzel bis zur betrachteten Klasse

    -   Inheritance Tree - Hybrid Approach: man müsste hier noch Katen für eine extends/extended by Beziehung haben.
    -   das macht es aufwändiger, den Graph zu bauen.

-   NOC: Number of Children ist die Anzahl der direkten Spezialisierungen einer Klasse.

    -   Inheritance Tree
    -   Query mit classname und extended classname
    -   Candidate Bildung: es muss dann in den usages der klase nach dem passenden Namespace geschaut werden,
        -   um eine eindeutige zurodnung zu bekmomen.
        -   -> ähnlich wie DIT, daher auch mit:
        -   Hybrid Approach möglich

-   Was ist ein Coupling Graph???
-   Oder bauen wir gerade einen Dependency Graph??

-   Zyklische Abhängigkeiten über neo4j kein Problem:

    -   MATCH p=(n)-[*1..15]->(n) RETURN nodes(p)

-   Zugriffe auf Packages in Übergeordneter Ebene

    -   Layer Violence (Zugriff auf verbotene Packages)
    -   oder auch sowas verbotenes ./../AnotherPackage/Subpackage

-   Abstractness / (In)Stability: - Instability [0,1]:= Outgoing Dependencies / (Incoming Dependencies + Outgoing Dependencies)
    I = 0 -> Maximum stable
    I = 1 -> Maximum UNstable
    => Hybrid Approach: yes

        -   Abstractness [0,1]: Ratio of Abstract Classes and Interfaces to the total number of classes:

    A = Number of Abstract Classes / Number of total classes
    A = 0 -> No abstract classes
    A = 1 -> Only abstract classes - -=> Hybrid Graph müsste Klassen in ihre Packages unterteilen (+ übergeordnete Package Nodes einfügen) - oder in CodeCharta mit einer neuen Metric berechnen: abstract_classes_and_interfaces_count - das könnte man da ja die Summe pro Package in CodeCharta sehen und den Ratio bilden.

-   Performant Alternatives (we could build them by specifing the output format e.g. --package-graph --oo-graph:
    -   File Graph: built from (filepath) imports
    -   Package Graph: built from imports and namespaces + class names
        -   für jede Class eine ClassNode anlegen + Node für Namespace als übergeordneter Package Node im Graph
        -   dann für jeden Import bzw. Importierten Namespace ein Package Node anlegen
            -   wenn es bereits dafür ein Package Node gibt, dann Kante von Klasse oder File hinzufügen.
