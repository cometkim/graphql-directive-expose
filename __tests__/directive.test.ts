import { printSchema } from 'graphql';
import { makeExecutableSchema } from '@graphql-tools/schema';
import { stripIndent } from 'common-tags';
import * as t from 'tap';

import { exposeDirective } from '../src/directive';

const gql = stripIndent;

t.test('no directives', async () => {
  const typeDefs = gql`
    type Query {
      foo: Foo!
      bar: Bar!
    }

    type Foo {
      id: ID!
      data: String
    }

    type Bar {
      id: ID!
      data: String
    }
  `;

  t.test('expose all by default', async () => {
    const { exposeDirectiveTypeDefs, exposeDirectiveTransformer } = exposeDirective();
    const schema = makeExecutableSchema({
      typeDefs: [
        typeDefs,
        exposeDirectiveTypeDefs,
      ],
      schemaTransforms: [exposeDirectiveTransformer],
    });

    const outputTypeDefs = printSchema(schema);
    t.like(outputTypeDefs, typeDefs);
    t.matchSnapshot(outputTypeDefs);
  });

  t.test('hide all with option', async () => {
    const { exposeDirectiveTypeDefs, exposeDirectiveTransformer } = exposeDirective([], false);
    const schema = makeExecutableSchema({
      typeDefs: [
        typeDefs,
        exposeDirectiveTypeDefs,
      ],
      schemaTransforms: [exposeDirectiveTransformer],
    });

    const outputTypeDefs = printSchema(schema);
    t.matchSnapshot(outputTypeDefs);
  });
});

t.test('@expose(to: ["a"]) directive on object type', async () => {
  const typeDefs = gql`
    type Query {
      foo: Foo!
      bar: Bar!
    }

    type Foo @expose(to: ["a"]) {
      id: ID!
      data: String
    }

    type Bar {
      id: ID!
      data: String
    }
  `;

  t.test('expose a (no effect)', async () => {
    const { exposeDirectiveTypeDefs, exposeDirectiveTransformer } = exposeDirective(["a"]);
    const schema = makeExecutableSchema({
      typeDefs: [
        typeDefs,
        exposeDirectiveTypeDefs,
      ],
      schemaTransforms: [exposeDirectiveTransformer],
    });

    const outputTypeDefs = printSchema(schema);

    t.matchSnapshot(outputTypeDefs);
  });

  t.test('expose only a', async () => {
    const { exposeDirectiveTypeDefs, exposeDirectiveTransformer } = exposeDirective(["a"], false);
    const schema = makeExecutableSchema({
      typeDefs: [
        typeDefs,
        exposeDirectiveTypeDefs,
      ],
      schemaTransforms: [exposeDirectiveTransformer],
    });

    const outputTypeDefs = printSchema(schema);

    t.like(outputTypeDefs, gql`
      type Query {
        foo: Foo!
      }
    `);

    t.like(outputTypeDefs, gql`
      type Foo {
        id: ID!
        data: String
      }
    `);

    t.notLike(outputTypeDefs, gql`type Bar`);

    t.matchSnapshot(outputTypeDefs);
  });
});
