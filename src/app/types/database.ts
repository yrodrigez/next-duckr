export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export interface Database {
  public: {
    Tables: {
      chat_message_read: {
        Row: {
          created_at: string
          id: string
          message_id: string
          read_at: string | null
          received_at: string
          room_id: string | null
          user_id: string
        }
        Insert: {
          created_at?: string
          id?: string
          message_id: string
          read_at?: string | null
          received_at?: string
          room_id?: string | null
          user_id: string
        }
        Update: {
          created_at?: string
          id?: string
          message_id?: string
          read_at?: string | null
          received_at?: string
          room_id?: string | null
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "chat_message_read_message_id_fkey"
            columns: ["message_id"]
            referencedRelation: "chat_messages"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "chat_message_read_room_id_fkey"
            columns: ["room_id"]
            referencedRelation: "chat_rooms"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "chat_message_read_room_id_fkey"
            columns: ["room_id"]
            referencedRelation: "chat_room_members_view"
            referencedColumns: ["room_id"]
          },
          {
            foreignKeyName: "chat_message_read_user_id_fkey"
            columns: ["user_id"]
            referencedRelation: "users"
            referencedColumns: ["id"]
          }
        ]
      }
      chat_messages: {
        Row: {
          created_at: string
          id: string
          message: string
          room_id: string
          user_id: string
        }
        Insert: {
          created_at?: string
          id?: string
          message: string
          room_id: string
          user_id: string
        }
        Update: {
          created_at?: string
          id?: string
          message?: string
          room_id?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "chat_messages_room_id_fkey"
            columns: ["room_id"]
            referencedRelation: "chat_rooms"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "chat_messages_room_id_fkey"
            columns: ["room_id"]
            referencedRelation: "chat_room_members_view"
            referencedColumns: ["room_id"]
          },
          {
            foreignKeyName: "chat_messages_user_id_fkey"
            columns: ["user_id"]
            referencedRelation: "users"
            referencedColumns: ["id"]
          }
        ]
      }
      chat_room_members: {
        Row: {
          created_at: string
          id: string
          room_id: string
          user_id: string
        }
        Insert: {
          created_at?: string
          id?: string
          room_id: string
          user_id: string
        }
        Update: {
          created_at?: string
          id?: string
          room_id?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "chat_room_members_room_id_fkey"
            columns: ["room_id"]
            referencedRelation: "chat_rooms"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "chat_room_members_room_id_fkey"
            columns: ["room_id"]
            referencedRelation: "chat_room_members_view"
            referencedColumns: ["room_id"]
          },
          {
            foreignKeyName: "chat_room_members_user_id_fkey"
            columns: ["user_id"]
            referencedRelation: "users"
            referencedColumns: ["id"]
          }
        ]
      }
      chat_rooms: {
        Row: {
          created_at: string
          id: string
          name: string | null
          owner_id: string | null
        }
        Insert: {
          created_at?: string
          id?: string
          name?: string | null
          owner_id?: string | null
        }
        Update: {
          created_at?: string
          id?: string
          name?: string | null
          owner_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "chat_rooms_owner_id_fkey"
            columns: ["owner_id"]
            referencedRelation: "users"
            referencedColumns: ["id"]
          }
        ]
      }
      follows: {
        Row: {
          created_at: string
          follower_id: string
          id: string
          user_id: string
        }
        Insert: {
          created_at?: string
          follower_id: string
          id?: string
          user_id: string
        }
        Update: {
          created_at?: string
          follower_id?: string
          id?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "follows_follower_id_fkey"
            columns: ["follower_id"]
            referencedRelation: "users"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "follows_user_id_fkey"
            columns: ["user_id"]
            referencedRelation: "users"
            referencedColumns: ["id"]
          }
        ]
      }
      likes: {
        Row: {
          created_at: string
          id: string
          post_id: string
          user_id: string
        }
        Insert: {
          created_at?: string
          id?: string
          post_id: string
          user_id: string
        }
        Update: {
          created_at?: string
          id?: string
          post_id?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "likes_post_id_fkey"
            columns: ["post_id"]
            referencedRelation: "posts"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "likes_user_id_fkey"
            columns: ["user_id"]
            referencedRelation: "users"
            referencedColumns: ["id"]
          }
        ]
      }
      posts: {
        Row: {
          content: string
          created_at: string
          id: string
          post_id: string | null
          user_id: string
        }
        Insert: {
          content: string
          created_at?: string
          id?: string
          post_id?: string | null
          user_id: string
        }
        Update: {
          content?: string
          created_at?: string
          id?: string
          post_id?: string | null
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "posts_post_id_fkey"
            columns: ["post_id"]
            referencedRelation: "posts"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "posts_user_id_fkey"
            columns: ["user_id"]
            referencedRelation: "users"
            referencedColumns: ["id"]
          }
        ]
      }
      users: {
        Row: {
          avatar_url: string | null
          created_at: string | null
          id: string
          last_modified: string | null
          name: string | null
          user_name: string | null
        }
        Insert: {
          avatar_url?: string | null
          created_at?: string | null
          id: string
          last_modified?: string | null
          name?: string | null
          user_name?: string | null
        }
        Update: {
          avatar_url?: string | null
          created_at?: string | null
          id?: string
          last_modified?: string | null
          name?: string | null
          user_name?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "users_id_fkey"
            columns: ["id"]
            referencedRelation: "users"
            referencedColumns: ["id"]
          }
        ]
      }
    }
    Views: {
      chat_room_members_view: {
        Row: {
          member_ids: string[] | null
          room_id: string | null
        }
        Relationships: []
      }
    }
    Functions: {
      get_accessible_rooms: {
        Args: {
          user_id: string
        }
        Returns: string[]
      }
      is_user_alloed_to_see_members: {
        Args: {
          tu_puta_madre_id: boolean
        }
        Returns: boolean
      }
      is_user_allowed_to_see_members: {
        Args: {
          tu_puta_madre_id: string
        }
        Returns: boolean
      }
      is_user_owner_of_room: {
        Args: {
          user_id: string
          room_id: string
        }
        Returns: boolean
      }
    }
    Enums: {
      [_ in never]: never
    }
    CompositeTypes: {
      [_ in never]: never
    }
  }
}
