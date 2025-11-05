import type Koa from 'koa';
import type {DefaultContext, DefaultState} from 'koa';
import {ENV} from '../../env';

export type Repository = {
  id: string;
  name: string;
  owner: string;
  url: string;
};

export type Release = {
  id: string;
  repoId: string;
  title: string;
  description: string;
  tag: string;
  publishedAt: string;
  seen: boolean;
};

const repositories = new Map<string, Repository>();
const releases = new Map<string, Release>();

export type DataSource = {
  repositories: Map<string, Repository>;
  releases: Map<string, Release>;
};

export type GraphQLContext = {
  env: typeof ENV;
  requestId: string;
  koa: Koa.ParameterizedContext<DefaultState, DefaultContext>;
  data: DataSource;
};

export function buildContext(ctx: Koa.Context): GraphQLContext {
  const requestId = crypto.randomUUID();
  return {env: ENV, requestId, koa: ctx, data: {repositories, releases}};
}
