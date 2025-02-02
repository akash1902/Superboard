import { Entity, Column, PrimaryGeneratedColumn } from 'typeorm';

@Entity()
export class Contract {
  @PrimaryGeneratedColumn('uuid') // Ensures it's an auto-generated UUID
  id: string;

  @Column()
  address: string;

  @Column()
  network: string;

  @Column({ type: 'text', nullable: true }) // Ensure nullable in case ABI isn't available initially
  abi: string;

  @Column({ type: 'json', nullable: true })
  transactions: any[];
}
