import type Koa from 'koa';
import type {DataSource} from 'typeorm';
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

export type GraphQLContext = {
  env: typeof ENV;
  requestId: string;
  koa: Koa.Context;
  db: DataSource;
};

export function buildContext(ctx: Koa.Context, db: DataSource): GraphQLContext {
  const requestId = crypto.randomUUID();
  return {env: ENV, requestId, koa: ctx, db};
}
