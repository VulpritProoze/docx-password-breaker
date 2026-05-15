# Config schema (input.json)

## Field reference
| Field | Type | Required | Default | Description |
| --- | --- | --- | --- | --- |
| output_dir | string | no | "./output" | Directory for unlocked files. |
| stop_on_first_success | boolean | no | true | Per job: stop after first success. If false, continue attempts but only write once. |
| jobs | array | yes | n/a | List of unlock jobs. |
| jobs[].file | string | yes | n/a | Path to the locked file. |
| jobs[].passwords | string[] | yes | n/a | Base candidate passwords. |

## Rules
- input.json is read from the current working directory.
- All file and directory paths are resolved with path.resolve(process.cwd(), ...).
- output_dir is created automatically if it does not exist.
- stop_on_first_success applies per job; false continues attempts after the first success.

## Minimal example
```json
{
  "jobs": [
    { "file": "./locked.docx", "passwords": ["MyPass2020"] }
  ]
}
```

## Multi-file example
```json
{
  "output_dir": "./output",
  "stop_on_first_success": false,
  "jobs": [
    { "file": "./locked.docx", "passwords": ["MyPass2020", "Backup"] },
    { "file": "./locked.xlsx", "passwords": ["Budget2024"] }
  ]
}
```
