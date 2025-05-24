import { BeforeInsert, Column, Entity, PrimaryGeneratedColumn } from 'typeorm';
import { v4 as uuidv4 } from 'uuid';


@Entity()
export class User {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ unique: true })
  uuid: string; // The UUID to hide the original ID

  @Column()
  firstName: string;

  @Column()
  lastName: string;

  @Column()
  email: string;

  @Column()
  password: string;

  @Column({nullable: true})
  resetPasswordToken?: string

  @Column({ type: 'timestamp', nullable: true })
  resetTokenExpire?: Date

  // Automatically generate UUID before inserting into the database
  @BeforeInsert()
  generateUuid() {
    this.uuid = uuidv4();
  }
}
