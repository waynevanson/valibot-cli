# `@waynevanson/cli`

A valibot powered CLI builder.

Inspired from the derive API in rust's `clap` crate.

## Quickstart

```ts
// Read file with a given config
import * as v from "valibot"
import * as c from "@waynevanson/valibot-cli"
import * as fs from 'node:fs'

// describe using valibot where possible,
// extend cli specific options using metadata
const schema = v.strictObject({
    config: c.flag(v.optional(v.string(), "./config.json"), {
        name: "config",
        longs: ["config"],
        shorts: ["c"]
    }),
    operation: v.subcommand(
        v.variant('type', {
            read: v.object({
                type: v.literal('read')
                filepath: c.value(v.string(), { name: "file" })
            }),
            write: v.object({
                type: v.literal('write')
                filepath: c.value(v.string(), { name: "file" })
                contents: c.value(v.string())
            })
        }),
        {
            name: "operation"
        }
    )
})

function main(){
    // Creates a valid input (not the output type) to the schema.
    const input = c.createInput(schema, process.argv.slice(2))

    // Whatever you like, probably applying the schema validation
    const args = v.parse(schema, input)

    // Application logic here

    const config = JSON.parse(fs.readFileSync(args.config))

    switch (args.operation.type) {
        case 'read':
            fs.readFileSync(args.filepath)
            break
        case "write":
            fs.writeFileSync(args.filepath)
            break
    }
}

// example
// <bin> -c configuration.json write '{ "name": "jay son" }' output.json
// <bin> -c configuration.json read input.json
main()
```
