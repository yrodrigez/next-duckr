import { type Database } from "./database";

export type UserEntity = Database['public']['Tables']['users']['Row']

export type User = UserEntity
