import {GraphQLError} from 'graphql';
import type {GraphQLContext, Release, Repository} from './context';

const toArray = <T>(m: Map<string, T>): T[] => Array.from(m.values());

function makeRepoId(owner: string, name: string) {
  return `repo_${owner}_${name}`.toLowerCase();
}

export const resolvers = {
  Query: {
    releases: (_: unknown, __: unknown, ctx: GraphQLContext): Release[] => {
      const list = toArray(ctx.data.releases);
      return list.sort((a, b) => (a.publishedAt < b.publishedAt ? 1 : -1));
    }
  },
  Mutation: {
    addRepository: (
      _: unknown,
      args: {input: {owner: string; name: string; url?: string | null}},
      ctx: GraphQLContext
    ): Repository => {
      const owner = args.input.owner.trim();
      const name = args.input.name.trim();
      if (!owner || !name) {
        throw new GraphQLError('owner and name are required');
      }
      const id = makeRepoId(owner, name);

      const existing = ctx.data.repositories.get(id);
      if (existing) return existing;

      const url = args.input.url ?? `https://github.com/${owner}/${name}`;
      const repo: Repository = {id, owner, name, url};
      ctx.data.repositories.set(id, repo);
      return repo;
    },

    markReleaseSeen: (_: unknown, args: {id: string}, ctx: GraphQLContext): Release => {
      const rel = ctx.data.releases.get(args.id);
      if (!rel) {
        throw new GraphQLError(`Release not found: ${args.id}`);
      }
      const updated = {...rel, seen: true};
      ctx.data.releases.set(args.id, updated);
      return updated;
    }
  }
};
