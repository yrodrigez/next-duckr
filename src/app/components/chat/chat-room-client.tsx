'use client'
import {ChatRoomTitle} from "@/app/components/chat/chat-room-title";
import {ChatMessages} from "@/app/components/chat/chat-messages-client";
import {ChatMessageSend} from "@/app/components/chat/send-chat-message-client";
import {useEffect, useState} from "react";
import {useRouter} from "next/navigation";
import {createClientComponentClient, createServerComponentClient} from "@supabase/auth-helpers-nextjs";


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
    database.from('chat_message_read')
        .update({read_at: new Date()})
        .filter('user_id', 'eq', userId)
        .filter('room_id', 'eq', roomId)
}

function sendMessage(database: any, currentUserId: string, message?: any, roomId?: string, usersIds?: string[], router?: any) {
    if (!message || !roomId) return
    const payload = {
        id: message.id,
        message: message.message,
        user_id: currentUserId,
        room_id: roomId
    }

    database.from('chat_messages')
        .insert(payload)
        .select('id').then(({data, error}: any) => {
        if (error) {
            router.refresh()
        }
        const [newMessage]: any = data
        if (!newMessage || !usersIds) return
        database.from('chat_message_read')
            .insert(usersIds.filter(x => x !== currentUserId).map(user_id => ({
                user_id,
                message_id: newMessage.id,
                room_id: roomId
            })))
    })
}

export function ChatRoom({
                             room,
                             currentUserId
                         }: { room: any, currentUserId: any }) {

    const {
        messages: initialMessages,
        members,
        id: roomId
    } = room
    const [messages, setMessages] = useState(initialMessages)
    const database = createClientComponentClient()
    const [membersWithPresence, setMembersWithPresence] = useState<any[]>([])
    useEffect(() => {
        const roomStatus = database.channel(`room:${roomId}`, {
            config: {
                presence: {
                    key: currentUserId,
                }
            }
        })

        roomStatus
            // @ts-ignore
            .on('presence', {event: 'sync'}, () => {
                const currentStatus = roomStatus.presenceState()
                const currentPresences = Object.keys(currentStatus)
                const membersWithPresence = members?.map(({users: user}: any) => {
                    const isOnline = currentPresences.includes(user.id)
                    return {
                        ...user,
                        isOnline
                    }
                })
                setMembersWithPresence(membersWithPresence)
            })
            .subscribe((payload: any) => {
                roomStatus.track({user_id: currentUserId}, {event: 'join'})
            })
        return () => {
            roomStatus.untrack()
            database.removeChannel(roomStatus)
        }
    }, [currentUserId]);

    useEffect(() => {
        const messagesChannel = database.channel('realtime messages')
            .on('postgres_changes', {
                event: '*',
                schema: 'public',
                table: 'chat_messages'
            }, ({new: newMessage}: any) => {
                updateReadAt(database, room.id, currentUserId)
                setMessages((prevMessages: any) => {
                    const user = members?.find(({users: user}: any) => user.id === newMessage.user_id)?.users
                    const newBubbleMessage = {
                        ...newMessage,
                        user
                    }
                    if (!prevMessages) return prevMessages
                    return updateOrInsertMessage(prevMessages, newBubbleMessage)
                })
            }).subscribe()
        return () => {
            database.removeChannel(messagesChannel)
        }
    }, [database, room.id, currentUserId])

    const router = useRouter()
    return (
        <>
            <ChatRoomTitle
                members={membersWithPresence}
                roomName={members?.[0]?.room?.name || 'Chat'}
                withBackButton
            />
            <ChatMessages
                currentUserId={currentUserId}
                messages={messages}
            />
            <ChatMessageSend
                onMessageSend={(newMessage: any) => {
                    setMessages((prevMessages: any) => {
                        if (!prevMessages) return prevMessages
                        return updateOrInsertMessage(prevMessages, newMessage)
                    })
                    sendMessage(database, currentUserId, newMessage, roomId, members?.map(({users: user}: any) => user.id), router)
                }}
            />
        </>
    )
}
