import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  ManyToOne,
  Index,
  CreateDateColumn,
  UpdateDateColumn,
  JoinColumn,
  Unique
} from 'typeorm';
import {RepositoryEntity} from './Repository';

@Entity({name: 'releases'})
@Unique('UQ_release_repo_tag', ['repo', 'tag'])
export class ReleaseEntity {
  @PrimaryGeneratedColumn('uuid')
  id!: string;

  @ManyToOne(() => RepositoryEntity, (repo) => repo.releases, {onDelete: 'CASCADE'})
  @JoinColumn({name: 'repo_id'})
  repo!: RepositoryEntity;

  @Index()
  @Column({name: 'tag', type: 'text'})
  tag!: string;

  @Column({type: 'text', nullable: true})
  title!: string | null;

  @Column({type: 'text', nullable: true})
  url!: string | null;

  @Index()
  @Column({type: 'timestamptz'})
  publishedAt!: Date;

  @Index()
  @Column({type: 'boolean', default: false})
  seen!: boolean;

  @CreateDateColumn({type: 'timestamptz'})
  createdAt!: Date;

  @UpdateDateColumn({type: 'timestamptz'})
  updatedAt!: Date;
}
