/* IMPORTANT
 * This snapshot file is auto-generated, but designed for humans.
 * It should be checked into source control and tracked carefully.
 * Re-generate by setting TAP_SNAPSHOT=1 and running tests.
 * Make sure to inspect the output below.  Do not ignore changes!
 */
'use strict'
exports[`__tests__/directive.test.ts TAP > must match snapshot 1`] = `
directive @expose(to: [String!]!) on OBJECT | INPUT_OBJECT

directive @hide(from: [String!]!) on OBJECT | INPUT_OBJECT | FIELD_DEFINITION | INPUT_FIELD_DEFINITION

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

`

exports[`__tests__/directive.test.ts TAP > must match snapshot 2`] = `
directive @expose(to: [String!]!) on OBJECT | INPUT_OBJECT

directive @hide(from: [String!]!) on OBJECT | INPUT_OBJECT | FIELD_DEFINITION | INPUT_FIELD_DEFINITION

type Query

`

exports[`__tests__/directive.test.ts TAP > must match snapshot 3`] = `
directive @expose(to: [String!]!) on OBJECT | INPUT_OBJECT

directive @hide(from: [String!]!) on OBJECT | INPUT_OBJECT | FIELD_DEFINITION | INPUT_FIELD_DEFINITION

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

`

exports[`__tests__/directive.test.ts TAP > must match snapshot 4`] = `
directive @expose(to: [String!]!) on OBJECT | INPUT_OBJECT

directive @hide(from: [String!]!) on OBJECT | INPUT_OBJECT | FIELD_DEFINITION | INPUT_FIELD_DEFINITION

type Query

type Foo

`
