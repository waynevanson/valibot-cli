import { ArgMetadata, getArgMethodMetadata } from "../methods"
import { tree, Tree } from "../utils"
import { ParsableSchema } from "./parse"

export interface Ast {
  args: ArgsAstNode
}

export type ArgsAstNode = Tree<ReadonlyArray<ArgAstNode<ArgMetadata>>>

export type ArgAstNode<Metadata extends ArgMetadata> = {
  id: symbol
  metadata: Metadata
  min: number
  max: number
}

export function createAst(schema: ParsableSchema): Ast {
  switch (schema.type) {
    case "string":
    case "number": {
      const metadata = getArgMethodMetadata(schema)
      return { args: tree([{ id: Symbol(), metadata, max: 1, min: 1 }]) }
    }

    case "array": {
      const metadata = getArgMethodMetadata(schema)
      return { args: tree([{ id: Symbol(), metadata, max: Infinity, min: 0 }]) }
    }

    case "strict_tuple": {
      const forest = schema.items.map((item) => createAst(item).args)
      return { args: tree([], forest) }
    }

    default:
      throw new Error()
  }
}
