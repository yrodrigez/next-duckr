import {type DatabaseClient} from "@/app/types/database-client";
import {type User} from "@/app/types/user";

export type ChatRoom = {
    id: string
    name: string
    members: User[]
}

export async function findAllRooms(database: DatabaseClient): Promise<ChatRoom[]> {
    const {data: rooms} = await database.from('chat_rooms')
        .select('*, members:chat_room_members(users(*))')
    return rooms || []
}
