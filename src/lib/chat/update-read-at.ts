import {type DatabaseClient} from "@/app/types/database-client";

/**
 * Update the read_at value for a user in a room to the current time
 * @param database Supabase client
 * @param roomId  Room ID
 * @param userId  User ID
 * @param messageId Optional message ID
 */
export function updateReadAt(database: DatabaseClient, roomId: string, userId: string, messageId?: string) {
    if (!messageId) {
        return database.from('chat_message_read')
            .update({read_at: new Date()})
            .filter('user_id', 'eq', userId)
            .filter('room_id', 'eq', roomId)
            .filter('read_at', 'is', null)
    }

    return database.from('chat_message_read')
        .update({read_at: new Date()})
        .filter('user_id', 'eq', userId)
        .filter('room_id', 'eq', roomId)
        .filter('read_at', 'is', null)
        .filter('message_id', 'eq', messageId)

}
