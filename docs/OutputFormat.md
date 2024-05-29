# THIS IS NOT YET IMPLEMENTED, but coming soon!

# Output Format

The output format of the program is a JSON file. The JSON file contains the following fields:
- `apiVersion`: The version of the generated JSON file. Some versions may not be compatible with different versions of consuming systems e.g. CodeCharta.
- `metricInfo`: A dictionary containing information about the metrics.
    - `title`: A descriptive title of the metric.
    - `description`: A description of the metric.
    - `higherIsBetter`: A boolean value indicating whether higher values of the metric are better.
    - `link`: A link to the MetricGardener GitHub page where the metric is defined and shown in detail how its calculated.
- `files`: A list of files containing information about the metrics for each file.
    - `file`: The relative path to the file.
    - `type`: The type of the node (e.g., source_code, etc.).
    - `metrics`: Each metric has a key-value pair where the key is the name of the metric and the value is the value of the metric.
- `relationalMetrics`: A dictionary containing information about the relational metrics in the graph. Each relational metric has the following fields:
    - `directional`: A boolean value indicating whether the metric is directional.
    - `relations`: A list of dictionaries containing information about the relations in the graph. Each relation has the following fields:
        - `fromFile`: The source file of the relation.
        - `toFile`: The destination file of the relation.


An example file is shown below:

```json
{
    "apiVersion": "1.0",
    "metricInfo": {
        "complexity": {
            "title": "Cyclomatic Complexity",
            "description": "asdf asdfhagfahg",
            "higherIsBetter": true,
            "link": "https://en.wikipedia.org/wiki/Cyclomatic_complexity"
        },
        "functions": {
            "title": "Number of Functions",
            "description": "asdf asdfhagfahg",
            "higherIsBetter": false,
            "link": "https://en.wikipedia.org/wiki/Cyclomatic_complexity"
        }
    },
    "files": [
        {
            "file": "/java/real_lines_of_code/RealLineOfCodeAndComments.java",
            "type": "source_code",
            "metrics": {
                "complexity": 5,
                "functions": 5,
                "classes": 1,
                "lines_of_code": 56,
                "comment_lines": 24,
                "real_lines_of_code": 23,
                "keywords_in_comments": 0,
                "coupling_between_objects": 5,
                "incoming_dependencies": 2,
                "instability": 0.6,
                "outgoing_dependencies": 3
            }
        },
        {
            "file": "/java/real_lines_of_code/InitializationBlock.java",
            "type": "source_code",
            "metrics": {
                "complexity": 2,
                "functions": 2,
                "classes": 1,
                "lines_of_code": 16,
                "comment_lines": 3,
                "real_lines_of_code": 10,
                "keywords_in_comments": 0,
                "coupling_between_objects": 5,
                "incoming_dependencies": 2,
                "instability": 0.6,
                "outgoing_dependencies": 3
            }
        }
    ],
    "relationalMetrics":
    {
        "coupling":{
            "directional": true,
            "relations": [
                {
                    "fromFile": "FastControllerInterface.php",
                    "toFile": "AnotherControllerInterface.php"
                },
                {
                    "fromFile": "FastControllerInterface.php",
                    "toFile": "AnotherControllerInterface.php"
                },
                {
                    "fromFile": "FastControllerInterface.php",
                    "toFile": "AnotherControllerInterface.php"
                }
            ]
        },
        "anotherMetric": {
            "directional": false,
            "relations": [
                {
                    "fromFile": "FastControllerInterface.php",
                    "toFile": "AnotherControllerInterface.php"
                },
                {
                    "fromFile": "FastControllerInterface.php",
                    "toFile": "AnotherControllerInterface.php"
                },
                {
                    "fromFile": "FastControllerInterface.php",
                    "toFile": "AnotherControllerInterface.php"
                }
            ]
        }
    }
}

```
