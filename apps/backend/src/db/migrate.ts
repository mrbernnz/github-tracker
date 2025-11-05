import 'reflect-metadata';
import {AppDataSource} from './data-source';

(async () => {
  const ds = await AppDataSource.initialize();
  try {
    await ds.runMigrations();
    console.log('Migrations applied.');
  } finally {
    await ds.destroy();
  }
})().catch((e) => {
  console.error(e);
  process.exit(1);
});
