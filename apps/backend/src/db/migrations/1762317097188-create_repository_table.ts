import {MigrationInterface, QueryRunner} from 'typeorm';

export class CreateRepositoryTable1762317097188 implements MigrationInterface {
  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
      CREATE TABLE IF NOT EXISTS repositories (
        id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
        owner text NOT NULL,
        name text NOT NULL,
        url text NOT NULL,
        "createdAt" timestamptz NOT NULL DEFAULT now(),
        "updatedAt" timestamptz NOT NULL DEFAULT now(),
        CONSTRAINT "UQ_repo_owner_name" UNIQUE (owner, name)
      );
    `);

    await queryRunner.query(`CREATE INDEX IF NOT EXISTS "IDX_repo_owner" ON repositories(owner);`);
    await queryRunner.query(`CREATE INDEX IF NOT EXISTS "IDX_repo_name"  ON repositories(name);`);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`DROP TABLE IF EXISTS repositories;`);
  }
}
