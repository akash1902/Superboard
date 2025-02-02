import { Entity, Column, ManyToOne, PrimaryGeneratedColumn } from 'typeorm';
import { Contract } from '../contracts/contract.entity';

@Entity()
export class Verification {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column()
  name: string;

  @Column({ enum: ['swap', 'staking', 'nft-transfer', /*...*/] })
  category: string;

  @Column()
  description: string;

  @ManyToOne(() => Contract)
  contract: Contract;

  @Column('jsonb')
  conditions: Record<string, any>;
}