import type { GraphQLFieldConfig, GraphQLInputFieldConfig, GraphQLInputObjectType, GraphQLObjectType, GraphQLSchema } from 'graphql';
import { DirectiveLocation } from 'graphql';
import { mapSchema, getDirectives, MapperKind } from '@graphql-tools/utils';

const DirectiveKey = {
  Expose: 'expose',
  Hide: 'hide',
} as const;

const DirectiveArgKey = {
  Expose: 'to',
  Hide: 'from',
} as const;

type ValueOf<T extends object> = T[keyof T];

interface PrintDirectiveDefinitionFn {
  (args: {
    on: Array<ValueOf<typeof DirectiveLocation>>,
    key: ValueOf<typeof DirectiveKey>,
    argKey: ValueOf<typeof DirectiveArgKey>,
    argType: string,
  }): string;
}
const printDirectiveDefinition: PrintDirectiveDefinitionFn = ({
  on,
  key,
  argKey,
  argType,
}) => `directive @${key}(${argKey}: ${argType}) on ${on.join(' | ')}`;

function intersect(set1: string[], set2: string[]) {
  return set1.some(v => set2.includes(v)) || set2.some(v => set1.includes(v));
}

export function exposeDirective(target: string | string[] = [], exposeDefault: boolean = true) {
  const targets = Array.isArray(target) ? target : [target];

  type ObjectType = GraphQLObjectType | GraphQLInputObjectType;
  type FieldType = GraphQLFieldConfig<any, any> | GraphQLInputFieldConfig;

  const exposes = new WeakSet<ObjectType | FieldType>();

  let prevObjectType: ObjectType;

  function mapObject<T extends ObjectType>(schema: GraphQLSchema, t: T) {
    let result: typeof t | null = exposeDefault ? t : null;

    if (t.name === 'Query' || t.name === 'Mutation' || t.name === 'Subscription') {
      prevObjectType = t;
      exposes.add(t);
      return t;
    }

    const directives = getDirectives(schema, t);
    if (!directives) return result;

    const { to: exposeTo = [] } = (directives[DirectiveKey.Expose] ?? {}) as { to?: string[] };
    const { from: hideFrom = [] } = (directives[DirectiveKey.Hide] ?? {}) as { from?: string[] };

    if (intersect(targets, hideFrom)) {
      result = null;
    } else if (intersect(targets, exposeTo)) {
      result = t;
    }

    prevObjectType = t;
    result && exposes.add(result);

    return result;
  }

  function mapField<T extends FieldType>(schema: GraphQLSchema, t: T) {
    let result: typeof t | null = (exposes.has(prevObjectType) || exposeDefault) ? t : null;

    console.log(`${prevObjectType?.astNode?.name.value}.${t.astNode}`);

    const directives = getDirectives(schema, t);
    if (!directives) return result;

    const { to: exposeTo = [] } = (directives[DirectiveKey.Expose] ?? {}) as { to?: string[] };
    const { from: hideFrom = [] } = (directives[DirectiveKey.Hide] ?? {}) as { from?: string[] };

    if (intersect(targets, hideFrom)) {
      result = null;
    } else if (intersect(targets, exposeTo)) {
      result = t;
    } else if (exposes.has(prevObjectType)) {
      result = t;
    }

    return result;
  }

  return {
    exposeDirectiveTypeDefs: `
      ${printDirectiveDefinition({
        on: [
          DirectiveLocation.OBJECT,
          DirectiveLocation.INPUT_OBJECT,
        ],
        key: DirectiveKey.Expose,
        argKey: DirectiveArgKey.Expose,
        argType: '[String!]!',
      })}
      ${printDirectiveDefinition({
        on: [
          DirectiveLocation.OBJECT,
          DirectiveLocation.INPUT_OBJECT,
          DirectiveLocation.FIELD_DEFINITION,
          DirectiveLocation.INPUT_FIELD_DEFINITION,
        ],
        key: DirectiveKey.Hide,
        argKey: DirectiveArgKey.Hide,
        argType: `[String!]!`,
      })}
    `,
    exposeDirectiveTransformer: (schema: GraphQLSchema) => mapSchema(schema, {
      [MapperKind.OBJECT_TYPE]: t => mapObject(schema, t),
      [MapperKind.OBJECT_FIELD]: t => mapField(schema, t),
      [MapperKind.INPUT_OBJECT_TYPE]: t => mapObject(schema, t),
      [MapperKind.INPUT_OBJECT_FIELD]: t => mapField(schema, t),
    }),
  };
}
