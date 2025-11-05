import {makeExecutableSchema} from '@graphql-tools/schema';
import {resolvers} from './resolvers';

const typeDefs = /* GraphQL */ `
  type Repository {
    id: ID!
    owner: String!
    name: String!
    url: String!
  }

  type Release {
    id: ID!
    repoId: ID!
    title: String
    description: String
    tag: String!
    publishedAt: String!
    seen: Boolean!
  }

  input AddRepositoryInput {
    owner: String!
    name: String!
    url: String
  }

  type Query {
    repositories: [Repository!]!
    repository(id: ID!): Repository
    releases: [Release!]!
    release(id: ID!): Release
  }

  type Mutation {
    addRepository(input: AddRepositoryInput!): Repository!
    markReleaseSeen(id: ID!): Release!
  }
`;

export const schema = makeExecutableSchema({
  typeDefs,
  resolvers
});
