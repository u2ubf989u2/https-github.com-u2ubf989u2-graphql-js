import type { ObjMap } from '../jsutils/ObjMap.ts';
import { inspect } from '../jsutils/inspect.ts';
import { invariant } from '../jsutils/invariant.ts';
import { keyValMap } from '../jsutils/keyValMap.ts';
import type { Maybe } from '../jsutils/Maybe.ts';
import { Kind } from '../language/kinds.ts';
import type { ValueNode } from '../language/ast.ts';
/**
 * Produces a JavaScript value given a GraphQL Value AST.
 *
 * Unlike `valueFromAST()`, no type is provided. The resulting JavaScript value
 * will reflect the provided GraphQL value AST.
 *
 * | GraphQL Value        | JavaScript Value |
 * | -------------------- | ---------------- |
 * | Input Object         | Object           |
 * | List                 | Array            |
 * | Boolean              | Boolean          |
 * | String / Enum        | String           |
 * | Int / Float          | Number           |
 * | Null                 | null             |
 *
 */

export function valueFromASTUntyped(
  valueNode: ValueNode,
  variables?: Maybe<ObjMap<unknown>>,
): unknown {
  switch (valueNode.kind) {
    case Kind.NULL:
      return null;

    case Kind.INT:
      return parseInt(valueNode.value, 10);

    case Kind.FLOAT:
      return parseFloat(valueNode.value);

    case Kind.STRING:
    case Kind.ENUM:
    case Kind.BOOLEAN:
      return valueNode.value;

    case Kind.LIST:
      return valueNode.values.map((node) =>
        valueFromASTUntyped(node, variables),
      );

    case Kind.OBJECT:
      return keyValMap(
        valueNode.fields,
        (field) => field.name.value,
        (field) => valueFromASTUntyped(field.value, variables),
      );

    case Kind.VARIABLE:
      return variables?.[valueNode.name.value];
  } // istanbul ignore next (Not reachable. All possible value nodes have been considered)

  false || invariant(false, 'Unexpected value node: ' + inspect(valueNode));
}
