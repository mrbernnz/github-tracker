import {GraphQLError} from 'graphql';
import {ReleaseEntity} from '../entities/Release';
import {RepositoryEntity} from '../entities/Repository';
import type {GraphQLContext, Repository} from './context';

export const resolvers = {
  Query: {
    releases: async (_: unknown, __: unknown, ctx: GraphQLContext): Promise<ReleaseEntity[]> => {
      const repo = ctx.db.getRepository(ReleaseEntity);
      return await repo.find({order: {publishedAt: 'DESC'}});
    }
  },
  Mutation: {
    addRepository: async (
      _: unknown,
      args: {input: {owner: string; name: string; url?: string | null}},
      ctx: GraphQLContext
    ): Promise<Repository> => {
      const owner = args.input.owner.trim();
      const name = args.input.name.trim();

      if (!owner || !name) {
        throw new GraphQLError('owner and name are required');
      }

      const existing = ctx.db.getRepository(RepositoryEntity);
      await existing.upsert(
        {owner, name, url: args.input.url ?? `https://github.com/${owner}/${name}`},
        {conflictPaths: ['owner', 'name'], skipUpdateIfNoValuesChanged: true}
      );

      return existing.findOneByOrFail({owner, name});
    },
    markReleaseSeen: async (
      _: unknown,
      args: {id: string},
      ctx: GraphQLContext
    ): Promise<ReleaseEntity> => {
      const rel = ctx.db.getRepository(ReleaseEntity);
      const existing = await rel.findOneBy({id: args.id});

      if (!existing) {
        throw new GraphQLError(`Release not found: ${args.id}`);
      }

      existing.seen = true;
      await rel.save(existing);
      return existing;
    }
  }
};
