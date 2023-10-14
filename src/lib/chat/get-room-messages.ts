import {type DatabaseClient} from "@/app/types/database-client";

export type ChatMessageStatus = {
    received_at: string
    read_at: string
    user_id: string
    id: string
}
export type ChatMessageOwner = {
    avatar_url: string
    name: string
    user_name: string
    id: string
}
export type ChatMessage = {
    id: string
    message: string
    created_at: string
    user: ChatMessageOwner
    statuses: ChatMessageStatus[]
}

export async function getRoomMessages(database: DatabaseClient, roomId: string): Promise<ChatMessage[]> {
    const {data: messages} = await database.from('chat_messages')
        .select('id, message, created_at, user:users(avatar_url, name, user_name, id), statuses:chat_message_read(received_at, read_at, user_id, id)')
        .filter('room_id', 'eq', roomId)
        .order('created_at', {ascending: false})
        .range(0, 50)

    return (messages || []).map(message => ({
        ...message,
        user: Array.isArray(message.user) ? message.user[0] : message.user || {
            avatar_url: '',
            name: '',
            user_name: '',
            id: ''
        },
        statuses: message.statuses || []
    }))

}
