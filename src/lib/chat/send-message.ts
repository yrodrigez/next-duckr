export async function sendMessage(database: any, currentUserId: string, message: any, roomId: string, usersIds: string[]): Promise<string | undefined> {
    const payload = {
        id: message.id,
        message: message.message,
        user_id: currentUserId,
        room_id: roomId
    }

    const {
        data,
        error
    } = await database.from('chat_messages')
        .insert(payload)
        .select('id')
    if (error) {
        throw new Error(error)
    }

    const [newMessage]: any = data
    if (!newMessage || !usersIds) return
    const {error: readError} = await database.from('chat_message_read')
        .insert(usersIds
            .filter(x => x !== currentUserId).map(user_id => ({
                user_id,
                message_id: newMessage.id,
                room_id: roomId
            })))
    if (readError) {
        throw new Error(readError)
    }

    return newMessage.id
}
