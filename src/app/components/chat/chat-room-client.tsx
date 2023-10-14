'use client'
import {ChatRoomTitle} from "@/app/components/chat/chat-room-title";
import {ChatMessages} from "@/app/components/chat/chat-messages-client";
import {ChatMessageSend} from "@/app/components/chat/send-chat-message-client";
import {useEffect, useState} from "react";
import {useRouter} from "next/navigation";
import {createClientComponentClient} from "@supabase/auth-helpers-nextjs";
import {type ChatRoom} from "@/app/chats/[room_id]/page";
import {getRoomMessages, type ChatMessage} from "@/lib/chat/get-room-messages";
import {type ChatMember} from "@/app/chats/[room_id]/page";
import {updateReadAt} from "@/lib/chat/update-read-at";
import {sendMessage} from "@/lib/chat/send-message";
import {throttle} from "@/lib/util/throttle";

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

    const setRead = ((newMessageRead: any) => {
        setMessages((prevMessages: any[]) => {
            if (!prevMessages) return []

            const message = prevMessages.find((message: any) => message.id === newMessageRead.message_id)
            if (!message) return prevMessages

            let newStatusCollection = message.statuses || []

            const statusIndex = newStatusCollection.findIndex((status: any) => status.id === newMessageRead.id)
            if (statusIndex === -1) {
                newStatusCollection.push(newMessageRead)
            } else {
                if (!newStatusCollection[statusIndex].read_at && newMessageRead.read_at) {
                    newStatusCollection[statusIndex] = newMessageRead
                }
            }

            return prevMessages.map((message: any) => {
                if (message.id === newMessageRead.message_id) {
                    return {
                        ...message,
                        statuses: newStatusCollection
                    }
                }
                return message
            })
        })
    })

    const addMessage = ((newMessage: any) => {
        setMessages((prevMessages: any) => {
            const user = members?.find((user: ChatMember) => user.id === newMessage.user_id)
            const newBubbleMessage = {
                ...newMessage,
                user
            }
            if (!prevMessages) return prevMessages
            return updateOrInsertMessage(prevMessages, newBubbleMessage)
        })
    })

    useEffect(() => {
            const messagesChannel = database.channel('realtime messages')
                .on('postgres_changes', {
                    event: '*',
                    schema: 'public',
                    table: 'chat_messages',
                    filter: `room_id=eq.${roomId}`
                }, async ({new: newMessage}: any) => {
                    await updateReadAt(database, roomId, currentUserId, newMessage.id)
                    addMessage(newMessage)
                })
                .on('postgres_changes', {
                    event: '*',
                    schema: 'public',
                    table: 'chat_message_read',
                    filter: `room_id=eq.${roomId}`
                }, ({new: newMessageRead}: any) => {
                    setRead(newMessageRead)
                })
                .subscribe()

            return () => {
                (async () => await database.removeChannel(messagesChannel))()
            }
        }, [database, roomId, currentUserId]
    )
}

export function ChatRoom({
                             room,
                             currentUserId
                         }: { room: ChatRoom, currentUserId: string }) {

    const {
        members: initialMembers,
        id: roomId,
        name: roomName,
    } = room
    const database = createClientComponentClient()
    const [membersWithPresence, setMembersWithPresence] = useState<any[]>(initialMembers)
    const [messages, setMessages] = useState<ChatMessage[]>([])
    const [isFetching, setIsFetching] = useState<boolean>(false)
    useEffect(() => {
        const getMessages = async () => {
            setIsFetching(true)
            const messages = await getRoomMessages(database, roomId)
            setMessages(messages)
            setIsFetching(false)
        }
        getMessages()
    }, []);

    usePresence(database, roomId, currentUserId, setMembersWithPresence)
    useOnNewMessage(database, roomId, currentUserId, initialMembers, setMessages)

    const router = useRouter()
    const _roomName = roomName || membersWithPresence.find((user: ChatMember) => user.id !== currentUserId)?.name
    return (
        <>
            <ChatRoomTitle
                members={membersWithPresence}
                roomName={_roomName}
                withBackButton
            />
            {isFetching ? <div className="flex justify-center items-center h-full">Loading...</div> :
                <ChatMessages
                    currentUserId={currentUserId}
                    messages={messages}
                />
            }
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
