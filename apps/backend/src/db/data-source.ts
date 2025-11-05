import 'reflect-metadata';
import {DataSource} from 'typeorm';
import {ENV} from '../../env';
import {ReleaseEntity} from '../entities/Release';
import {RepositoryEntity} from '../entities/Repository';

export const AppDataSource = new DataSource({
  type: 'postgres',
  url: ENV.DATABASE_URL ?? undefined,
  host: ENV.DATABASE_URL ? undefined : ENV.DB_HOST,
  port: ENV.DATABASE_URL ? undefined : ENV.DB_PORT,
  username: ENV.DATABASE_URL ? undefined : ENV.DB_USER,
  password: ENV.DATABASE_URL ? undefined : ENV.DB_PASSWORD,
  database: ENV.DATABASE_URL ? undefined : ENV.DB_NAME,
  // ssl: ENV.DB_SSL ? {rejectUnauthorized: false} : undefined,
  ssl: false,
  entities: [RepositoryEntity, ReleaseEntity],
  migrations: ['src/db/migrations/*.ts'],
  synchronize: ENV.DB_SYNC, // dev only
  logging: false
});
