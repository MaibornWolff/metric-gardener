# Contribution Guidelines

Thank you for your interest in contributing to our project :)<br>
We like issue reports, suggestions and pull request from everyone.

If you are planning to make a major contribution for which there is no existing issue, we would appreciate that you open an issue first.

The following suggestions increase the chance that your pull request can be accepted:

-   Write clean code
-   Write tests for your new code
-   Check that all tests are still passed
-   Adhere to the naming conventions for branch names and commit messages mentioned below
-   Avoid unnecessary breaking changes

You and your code contribution has to adherence to the licence of this project.

## Naming Conventions

### Branch Names

Branch names should follow the following structure: `<type>/<issue-id>/<name>`

-   `<type>` is the type of the change (see table below).
-   `<number>` is the number of the corresponding issue on GitHub the branch should resolve.
-   `<name>` is a describing branch name, which should be in **lowercase** separated by **dashes**.

### Allowed Change Types

| Change Type | Description                            |
| ----------- | -------------------------------------- |
| `feat`      | Added new or expanded existing feature |
| `fix`       | Bugfixes                               |
| `docs`      | Updated documentation only             |
| `revert`    | Revert of some commit                  |
| `style`     | Code style improvements                |
| `refactor`  | Major refactorings                     |
| `tech`      | Other kinds of technical changes       |

Examples:

-   `feat/123/settings-option-xyz`
-   `fix/124/unexpected-settings-error`

### Commit Messages

Commit messages should follow the [Conventional Commits standard](https://www.conventionalcommits.org/en/v1.0.0/) with the following additional rules:

-   The first line MUST end with the id of the corresponding issue on GitHub
-   The type MUST be one of the types in the table "allowed change types" above

This results in the following structure for commit messages:

```
<type>[optional scope]: <description> #<issue-id>

[optional body]

[optional footer(s)]
```

#### Examples for acceptable commit messages:

-   `fix: wrong expected result in test case for java #1`
-   `feat: records are now supported for C# #2`
-   ```
    feat!: change format of the json output #3

    Introduced new field named info that might break code which works with our json output
    ```

-   `tech: improve handling of errors in GenericParser.ts #4`
