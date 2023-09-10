import { Database } from "./database";

type LikeEntity = Database['public']['Tables']['likes']['Row']

export type Like = LikeEntity