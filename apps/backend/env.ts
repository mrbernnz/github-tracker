import {z} from 'zod';

const EnvSchema = z.object({
  NODE_ENV: z.enum(['development', 'test', 'production']).default('development'),
  PORT: z.coerce.number().int().positive().default(3000),

  DATABASE_URL: z.string().url().optional(),
  DB_HOST: z.string().optional(),
  DB_PORT: z.coerce.number().optional(),
  DB_USER: z.string().optional(),
  DB_PASSWORD: z.string().optional(),
  DB_NAME: z.string().optional(),
  DB_SSL: z.coerce.boolean().default(false),
  DB_SYNC: z.coerce.boolean().default(false),

  GITHUB_TOKEN: z.string().optional()
});

export type Env = z.infer<typeof EnvSchema>;
export const ENV = EnvSchema.parse(process.env);
