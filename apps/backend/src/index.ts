import cors from '@koa/cors';
import 'dotenv/config';
import {createHandler} from 'graphql-http/lib/use/koa';
import Koa, {Context, Next} from 'koa';
import bodyParser from 'koa-bodyparser';
import {ruruHTML} from 'ruru/server';
import {ENV} from '../env';
import {AppDataSource} from './db/data-source';
import {buildContext, schema} from './graphql';

function acceptsHtml(ctx: Koa.Context) {
  const accept = ctx.get('accept');
  return accept && accept.includes('text/html');
}

const app = new Koa();

app.use(async (ctx: Context, next: Next) => {
  try {
    await next();
  } catch (error: any) {
    ctx.status = (error?.status as number) ?? 500;
    ctx.body = {error: error?.message ?? 'Internal Message'};
    ctx.app.emit('error', error, ctx);
  }
});

app.use(cors());
app.use(bodyParser());

app.use((ctx: Context, next: Next) => {
  if (ctx.path === '/graphql' && ctx.method === 'GET' && acceptsHtml(ctx)) {
    ctx.type = 'text/html';
    ctx.body = ruruHTML({endpoint: '/graphql'});
    return;
  }
  return next();
});

app.use(
  createHandler({
    schema,
    context: (_req, ctx) => buildContext(ctx, AppDataSource)
  })
);

await AppDataSource.initialize();

app.listen(ENV.PORT, () => {
  console.log(`Server is running on port ${ENV.PORT}`);
});

export default app;
