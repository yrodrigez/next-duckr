'use client'
import {ChatRoomTitle} from "@/app/components/chat/chat-room-title";
import {ChatMessages} from "@/app/components/chat/chat-messages-client";
import {ChatMessageSend} from "@/app/components/chat/send-chat-message-client";
import {experimental_useOptimistic as useOptimistic, useEffect, useState} from "react";
import {useRouter} from "next/navigation";
import {createClientComponentClient} from "@supabase/auth-helpers-nextjs";
import {ChatMessageBubbleProps} from "@/app/components/chat/chat-message-bubble";

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
    const [optimisticMessages, addOptimisticMessage] = useOptimistic<any, any>(messages, (currentMessages, newMessage) => {
        if (!currentMessages || !newMessage) return currentMessages;

        return updateOrInsertMessage(currentMessages, newMessage);
    })
    const router = useRouter()
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
    }, []);

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
                    const newBubbleMessage: ChatMessageBubbleProps = {
                        ...newMessage,
                        user,
                        currentUserId
                    }
                    if (!prevMessages) return prevMessages
                    return updateOrInsertMessage(prevMessages, newBubbleMessage)
                })

                router.refresh()
            }).subscribe()

        return () => {
            database.removeChannel(messagesChannel)
        }
    }, [database, room.id, currentUserId])

    return (
        <>
            <ChatRoomTitle
                members={membersWithPresence}
                roomName={members?.[0]?.room?.name || 'Chat'}
                withBackButton
            />
            <ChatMessages
                currentUserId={currentUserId}
                messages={optimisticMessages}
            />
            <ChatMessageSend
                onMessageSend={addOptimisticMessage}
            />
        </>
    )
}
