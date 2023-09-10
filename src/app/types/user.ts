import { type Database } from "./database";

type UserEntity = Database['public']['Tables']['users']['Row']

export type User = UserEntity