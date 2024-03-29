import { BaseEntity } from 'src/common/entity/base.entity';
import { User } from 'src/modules/user/entity/user.entity';
import {
  Column,
  Entity,
  Index,
  JoinColumn,
  JoinTable,
  ManyToMany,
  ManyToOne,
} from 'typeorm';
import { Comment } from './comment.entity';

@Entity()
export class Reply extends BaseEntity {
  @ManyToOne(() => User, { nullable: false })
  @JoinColumn({ name: 'user_id' })
  @Index()
  user: User;

  @ManyToOne(() => Comment, (comment) => comment.replys)
  @JoinColumn({ name: 'comment_id' })
  @Index()
  comment: Comment;

  @Column({ type: 'varchar', length: 255 })
  content: string;

  @JoinTable({
    joinColumn: { name: 'reply_id' },
    inverseJoinColumn: { name: 'user_id' },
  })
  @ManyToMany(() => User)
  likes: User[];
}
