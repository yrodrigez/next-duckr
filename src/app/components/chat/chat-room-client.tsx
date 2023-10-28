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
import {useTabFocus} from "@/lib/util/use-tab-focus";
import {updateOrInsertMessage} from "@/app/components/chat/chat-utils/update-or-insert-message";
import {usePresence} from "@/app/components/chat/chat-utils/chat-hook-presence";
import {useOnNewMessage} from "@/app/components/chat/chat-utils/chat-hook-on-new-message";

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
    const router = useRouter()

    useEffect(() => {
        const getMessages = async () => {
            setIsFetching(true)
            const messages = await getRoomMessages(database, roomId)
            setMessages(messages)
            setIsFetching(false)
        }
        getMessages()
    }, []);

    const isFocused = useTabFocus({
        onFocus: async () => {
            document.title = 'Duckr'
            await updateReadAt(database, roomId, currentUserId)
            console.log('focused')
        }
    })

    usePresence(database, roomId, currentUserId, setMembersWithPresence)
    useOnNewMessage(database, roomId, currentUserId, initialMembers, setMessages, isFocused)

    return (
        <>
            <ChatRoomTitle
                members={membersWithPresence}
                roomName={roomName}
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
