import { type Database } from "./database";

type PostEntity = Database['public']['Tables']['posts']['Row']
type UserEntity = Database['public']['Tables']['users']['Row']
type LikeEntity = Database['public']['Tables']['likes']['Row']

export type Post = PostEntity & { user: UserEntity } & { likes: LikeEntity[] }
