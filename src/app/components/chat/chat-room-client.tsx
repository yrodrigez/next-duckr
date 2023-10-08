'use client'
import {ChatRoomTitle} from "@/app/components/chat/chat-room-title";
import {ChatMessages} from "@/app/components/chat/chat-messages-client";
import {ChatMessageSend} from "@/app/components/chat/send-chat-message-client";
import {useEffect, useState} from "react";
import {useRouter} from "next/navigation";
import {createClientComponentClient} from "@supabase/auth-helpers-nextjs";
import {type ChatMember, type ChatRoom} from "@/app/chats/[room_id]/page";

const updateOrInsertMessage = (messages: any, newMessage: any) => {
    const newMessages = [...messages];
    const indexById = newMessages.findIndex(msg => msg.id === newMessage.id);

    if (indexById !== -1) {
        newMessages[indexById] = newMessage;
        return newMessages;
    }

    newMessages.push(newMessage);

    return newMessages;
}

function updateReadAt(database: any, roomId: string, userId: string) {
    return database.from('chat_message_read')
        .update({read_at: new Date()})
        .filter('user_id', 'eq', userId)
        .filter('room_id', 'eq', roomId)
}

async function sendMessage(database: any, currentUserId: string, message?: any, roomId?: string, usersIds?: string[]) {
    if (!message || !roomId) return
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

const usePresence = (database: any, roomId: string, currentUserId: string, setMembersWithPresence: Function) => {

    useEffect(() => {
        const roomStatus = database.channel(`room:${roomId}`, {
            config: {
                presence: {
                    key: currentUserId,
                }
            }
        })

        let currentPresences: string[] = []
        roomStatus
            // @ts-ignore
            .on('presence', {event: 'sync'}, () => {
                const currentStatus = roomStatus.presenceState()
                currentPresences = Object.keys(currentStatus)
                console.log(currentPresences)
                setMembersWithPresence((membersWithPresence: any) => membersWithPresence?.map((user: ChatMember) => {
                    const isOnline = currentPresences.includes(user?.id)
                    return {
                        ...user,
                        isOnline
                    }
                }))
            })
            .subscribe(() => {
                roomStatus.track({user_id: currentUserId}, {event: 'join'})
            })
        return () => {
            roomStatus.untrack()
            database.removeChannel(roomStatus)
        }
    }, [currentUserId])
}

const useOnNewMessage = (database: any, roomId: string, currentUserId: string, members: any, setMessages: any) => {
    useEffect(() => {
        const messagesChannel = database.channel('realtime messages')
            .on('postgres_changes', {
                event: '*',
                schema: 'public',
                table: 'chat_messages'
            }, async ({new: newMessage}: any) => {
                await updateReadAt(database, roomId, currentUserId)
                setMessages((prevMessages: any) => {
                    const user = members?.find((user: ChatMember) => user.id === newMessage.user_id)
                    const newBubbleMessage = {
                        ...newMessage,
                        user
                    }
                    if (!prevMessages) return prevMessages
                    return updateOrInsertMessage(prevMessages, newBubbleMessage)
                })
            }).subscribe()
        return () => {
            (async () => await database.removeChannel(messagesChannel))()
        }
    }, [database, roomId, currentUserId])
}

export function ChatRoom({
                             room,
                             currentUserId
                         }: { room: ChatRoom, currentUserId: string }) {

    const {
        messages: initialMessages,
        members: initialMembers,
        id: roomId,
        name: roomName,
    } = room
    const database = createClientComponentClient()

    const [membersWithPresence, setMembersWithPresence] = useState<any[]>(initialMembers)
    const [messages, setMessages] = useState(initialMessages)

    usePresence(database, roomId, currentUserId, setMembersWithPresence)
    useOnNewMessage(database, roomId, currentUserId, initialMembers, setMessages)

    const router = useRouter()
    const _roomName = roomName || membersWithPresence.find((user: ChatMember) => user.id !== currentUserId)?.name
    return (
        <>
            <div className="fixed max-w-[600px] w-full z-10 bg-black">
                <ChatRoomTitle
                    members={membersWithPresence}
                    roomName={_roomName}
                    withBackButton
                />
            </div>
            <ChatMessages
                currentUserId={currentUserId}
                messages={messages}
            />
            <ChatMessageSend
                onMessageSend={async (newMessage: any) => {
                    setMessages((prevMessages: any) => {
                        if (!prevMessages) return prevMessages
                        return updateOrInsertMessage(prevMessages, newMessage)
                    })
                    try {
                        await sendMessage(database, currentUserId, newMessage, roomId, membersWithPresence?.map((user: ChatMember) => user.id))
                    } catch (e) {
                        router.refresh()
                    }
                }}
            />
        </>
    )
}
