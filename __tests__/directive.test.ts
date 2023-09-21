import { printSchema } from 'graphql';
import { makeExecutableSchema } from '@graphql-tools/schema';
import { stripIndent } from 'common-tags';
import { test, expect } from 'vitest';

import { exposeDirective } from '../src/directive';

const gql = stripIndent;

test('no directives', async () => {
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

  test('expose all by default', async () => {
    const { exposeDirectiveTypeDefs, exposeDirectiveTransformer } = exposeDirective();
    const schema = makeExecutableSchema({
      typeDefs: [
        typeDefs,
        exposeDirectiveTypeDefs,
      ],
      schemaTransforms: [exposeDirectiveTransformer],
    });

    const outputTypeDefs = printSchema(schema);
    expect(outputTypeDefs).toMatch(typeDefs);
    expect(outputTypeDefs).toMatchSnapshot();
  });

  test('hide all with option', async () => {
    const { exposeDirectiveTypeDefs, exposeDirectiveTransformer } = exposeDirective([], false);
    const schema = makeExecutableSchema({
      typeDefs: [
        typeDefs,
        exposeDirectiveTypeDefs,
      ],
      schemaTransforms: [exposeDirectiveTransformer],
    });

    const outputTypeDefs = printSchema(schema);
    expect(outputTypeDefs).toMatchSnapshot();
  });
});

test('@expose(to: ["a"]) directive on object type', async () => {
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

  test('expose a (no effect)', async () => {
    const { exposeDirectiveTypeDefs, exposeDirectiveTransformer } = exposeDirective(["a"]);
    const schema = makeExecutableSchema({
      typeDefs: [
        typeDefs,
        exposeDirectiveTypeDefs,
      ],
      schemaTransforms: [exposeDirectiveTransformer],
    });

    const outputTypeDefs = printSchema(schema);

    expect(outputTypeDefs).toMatchSnapshot();
  });

  test('expose only a', async () => {
    const { exposeDirectiveTypeDefs, exposeDirectiveTransformer } = exposeDirective(["a"], false);
    const schema = makeExecutableSchema({
      typeDefs: [
        typeDefs,
        exposeDirectiveTypeDefs,
      ],
      schemaTransforms: [exposeDirectiveTransformer],
    });

    const outputTypeDefs = printSchema(schema);

    expect(outputTypeDefs).toMatch(gql`
      type Query {
        foo: Foo!
      }
    `);

    expect(outputTypeDefs).toMatch(gql`
      type Foo {
        id: ID!
        data: String
      }
    `);

    expect(outputTypeDefs).not.toMatch(gql`type Bar`);

    expect(outputTypeDefs).toMatchSnapshot();
  });
});
