## This is a node based parser to calculate metrics

### Supported Languages

-   C# (no unit tests -> not stable)
-   Java (no unit tests -> not stable)
-   JavaScript (no unit tests -> not stable)
-   Kotlin (no unit tests-> not stable)

-   Go (incompletely unit tested -> not stable)

-   PHP (all metrics unit tested -> stable)
-   TypeScript (all metrics unit tested -> stable)

### Supported Metrics

-   mcc
-   functions
-   classes

### Usage

For object-oriented metrics setup neo4j DB first:

-   `cd projects/node-parser/; docker run --publish=7474:7474 --publish=7687:7687 --volume=${PWD}/neo4j/data:/data neo4j --env=NEO4J_AUTH=none`

Then parse your sources:

-   `npm install`
-   `npm run start -- -o /output/file/path.json` to parse some provided example code
-   `npm run start -- /path/to/sources -o /output/file/path.json` specify the path to a folder or a file with source code

The metrics will be printed during parsing and passed to ./resources/output.json file.

# Neo4J:

-   Visit `http://localhost:7474/` with `admin/admin`

### TODOs

-   Debug changed Coupling metric for CSharp projects (Unit test would be best)
-   Resolve cyclic Dependency in TreeParser and Namespace/Usage Collectors -> Add dedicated Namespace/Usage Parsers
-   Performance
-   Provide more command line options
-   Handle multiple file extensions during parsing on the fly
-   Output calculated metrics in a file/json
-   Create output files, if they not exist before.
-   Separate Infrastructure from Domain Code
-   Write command to add new language and map expressions
-   Write command to generate/import specified node-types.json files
-   Support more languages
-   Unit Tests

### Proof of concept for object-oriented-metrics

WMC: Weighted Methods per Class entspricht der Anzahl aller Komplexitäten aller Methoden einer Klasse.
entspricht Zyklomatischer Komplexität einer Klasse

Hybrid Approach: Graph mit Classes als Nodes, Edges als Coupling Info und ParseTree als Metadata pro Node.

CBO: Coupling between Objects ist gleich der Anzahl der mit der betrachteten Klasse gekoppelten Klasse(n).
Coupling - Call Graph? Vermutlich möglich - Hybrid Approach: yes - MATCH (n:Class)-[r:USES]-() RETURN n, COUNT(r)

RFC: Response for class ist die Anzahl aller möglichen auszuführenden Methoden. - Call Graph? was ist mit extends? Parent classes werden auch in Sonar nicht berücksichtigt. - Hybrid Approach: pro gekoppelter Klasse (und self) public und static Methoden counten

LCOM4: Would need a Call Graph (count of transitiv cohesive call paths) - Call Graph
LCOM: Lack of Cohesion ist gleich der Paare von Methoden ohne gemeinsame Instanzvariablen. Abzüglich der Paare von Methoden mit gm. Instv. - Brute Force oder vermutlich auch über Call Graph möglich - Hybrid Approach: nein außer man nutzt den vorberechneten Parsetree pro Klasse, um die Methoden zu querien. - dann müsste man aber wieder pro Methode Queries abschicken, um deren Calls und Property uses zu finden. - das müsste man dann noch mal kombinatorisch auflösen, um zu wissen, ob Kohäsion vorliegt oder nicht (bruteforce like)

DIT: Depth of Inheritance Tree ist die maximale Pfadlänge von der Wurzel bis zur betrachteten Klasse - Inheritance Tree - Hybrid Approach: man müsste hier noch Katen für eine extends/extended by Beziehung haben. - das macht es aufwändiger, den Graph zu bauen. - über den Namespaces Collector könnte man den Query so erweitern, dass der eine Query noch das extends mit abfragt.
-> so könnte man diese Kanten ohne großen Mehraufwand bauen.
-> vermutlich bauen von Candidates aus Klassenname und Usages

NOC: Number of Children ist die Anzahl der direkten Spezialisierungen einer Klasse. - Inheritance Tree
Query mit classname und extended classname
Candidate Bildung: es muss dann in den usages der klase nach dem passenden Namespace geschaut werden,
um eine eindeutige zurodnung zu bekmomen.
-> ähnlich wie DIT, daher auch mit:

-   Hybrid Approach möglich

Was ist ein Coupling Graph???
Oder bauen wir gerade einen Dependency Graph??

Abstractness / (In)Stability:
Instability [0,1]:= Outgoing Dependencies / (Incoming Dependencies + Outgoing Dependencies)
I = 0 -> Maximum stable
I = 1 -> Maximum UNstable
=> Hybrid Approach: yes

Abstractness [0,1]: Ratio of Abstract Classes and Interfaces to the total number of classes:
A = Number of Abstract Classes / Number of total classes
A = 0 -> No abstract classes
A = 1 -> Only abstract classes
=> Hybrid Graph müsste Klassen in ihre Packages unterteilen (+ übergeordnete Package Nodes einfügen) - oder in CodeCharta mit einer neuen Metric berechnen: abstract_classes_and_interfaces_count - das könnte man da ja als Summe pro Package sehen und den Ratio bilden.

Zyklische Abhängigkeiten über neo4j kein Problem: - MATCH p=(n)-[*1..15]->(n) RETURN nodes(p)

Zugriffe auf Packages in Übergeordneter Ebene oder auch sowas verbotenes ./../AnotherPackage/Subpackage
