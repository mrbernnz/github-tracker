import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  Index,
  OneToMany,
  CreateDateColumn,
  UpdateDateColumn,
  Unique
} from 'typeorm';
import {ReleaseEntity} from './Release';

@Entity({name: 'repositories'})
@Unique('UQ_repo_owner_name', ['owner', 'name'])
export class RepositoryEntity {
  @PrimaryGeneratedColumn('uuid')
  id!: string;

  @Index()
  @Column({type: 'text'})
  owner!: string;

  @Index()
  @Column({type: 'text'})
  name!: string;

  @Column({type: 'text'})
  url!: string;

  @OneToMany(() => ReleaseEntity, (rel) => rel.repo)
  releases!: ReleaseEntity[];

  @CreateDateColumn({type: 'timestamptz'})
  createdAt!: Date;

  @UpdateDateColumn({type: 'timestamptz'})
  updatedAt!: Date;
}
