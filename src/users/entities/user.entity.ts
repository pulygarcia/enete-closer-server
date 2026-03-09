import {
  Entity,
  PrimaryColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
} from "typeorm";

export enum UserRole {
  ADMIN = "ADMIN",
  SELLER = "SELLER",
  VIEWER = "VIEWER",
}

/**
 * Entidad alineada con el esquema de Better Auth (tabla "user"). Revisar campos base en docs de better auth-
 * Campos adicionales (user.additionalFields): role.
 */
@Entity("user", {synchronize: false})
export class User {
  @PrimaryColumn({ type: "varchar", length: 255 })
  id: string;

  @Column({ type: "varchar", length: 255 })
  name: string;

  @Column({ type: "varchar", length: 255, unique: true })
  email: string;

  @Column({ type: "boolean", default: false })
  emailVerified: boolean;

  @Column({ type: "varchar", length: 500, nullable: true })
  image: string;

  @Column({
    type: "varchar",
    length: 20,
    default: UserRole.VIEWER,
  })
  role: UserRole;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;

}
