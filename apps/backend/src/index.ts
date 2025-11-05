// import 'dotenv/config';
import cors from '@koa/cors';
import Router from '@koa/router';
import Koa, {Context, Next} from 'koa';
import bodyParser from 'koa-bodyparser';
import {ENV} from '../env';

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

const router = new Router({prefix: '/api'});

router.get('/releases', (ctx) => {
  ctx.body = {message: 'getting repo release info.'};
});

router.put('/releases/:id', (ctx) => {
  ctx.body = {message: 'marked release as seen.'};
});

router.post('/repositories', (ctx) => {
  ctx.body = {message: 'add repository to track.'};
});

app.use(router.routes()).use(router.allowedMethods());

app.listen(ENV.PORT, () => {
  console.log(`Server is running on port ${ENV.PORT}`);
});

export default app;
