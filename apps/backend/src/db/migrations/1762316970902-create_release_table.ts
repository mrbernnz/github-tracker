import {MigrationInterface, QueryRunner} from 'typeorm';

export class CreateReleaseTable1762316970902 implements MigrationInterface {
  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
      CREATE TABLE IF NOT EXISTS releases (
        id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
        repo_id uuid NOT NULL REFERENCES repositories(id) ON DELETE CASCADE,
        tag text NOT NULL,
        title text NULL,
        url text NULL,
        "publishedAt" timestamptz NOT NULL,
        seen boolean NOT NULL DEFAULT false,
        "createdAt" timestamptz NOT NULL DEFAULT now(),
        "updatedAt" timestamptz NOT NULL DEFAULT now(),
        CONSTRAINT "UQ_release_repo_tag" UNIQUE (repo_id, tag)
      );
    `);

    await queryRunner.query(
      `CREATE INDEX IF NOT EXISTS "IDX_release_published" ON releases("publishedAt");`
    );
    await queryRunner.query(`CREATE INDEX IF NOT EXISTS "IDX_release_seen" ON releases(seen);`);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`DROP TABLE IF EXISTS releases;`);
  }
}
