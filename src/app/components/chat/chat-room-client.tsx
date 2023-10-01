'use client'
import {ChatRoomTitle} from "@/app/components/chat/chat-room-title";
import {ChatMessages} from "@/app/components/chat/chat-messages-client";
import {ChatMessageSend} from "@/app/components/send-chat-message-client";
import {experimental_useOptimistic as useOptimistic, useEffect} from "react";
import {useRouter} from "next/navigation";
import {createClientComponentClient} from "@supabase/auth-helpers-nextjs";

const updateOrInsertMessage = (messages: any, newMessage: any) => {
    const newMessages = [...messages];
    const indexById = newMessages.findIndex(msg => msg.id === newMessage.id);

    if (indexById !== -1) {
        newMessages[indexById] = newMessage;
        return newMessages;
    }

    const indexByDate = newMessages.findIndex(msg => msg.created_at < newMessage.created_at);
    if (indexByDate === -1) {
        newMessages.push(newMessage);
    } else {
        newMessages.splice(indexByDate, 0, newMessage);
    }

    return newMessages;
}

export function ChatRoom({
                             room,
                             currentUserId
                         }: { room: any, currentUserId: any }) {

    const {
        messages,
        members
    } = room
    const [optimisticMessages, addOptimisticMessage] = useOptimistic<any, any>(messages, (currentMessages, newMessage) => {
        if (!currentMessages || !newMessage) return currentMessages;

        return updateOrInsertMessage(currentMessages, newMessage);
    })
    const router = useRouter()
    const database = createClientComponentClient()
    useEffect(() => {
        const messagesChannel = database.channel('realtime messages')
            .on('postgres_changes', {
                event: '*',
                schema: 'public',
                table: 'chat_messages'
            }, router.refresh).subscribe()

        return () => {
            database.removeChannel(messagesChannel)
        }
    }, [database, optimisticMessages])

    return (
        <>
            <ChatRoomTitle
                members={members?.map(({users: user}: any) => user)}
                roomName={members?.[0]?.room?.name || 'Chat'}
            />
            <ChatMessages
                currentUserId={currentUserId}
                messages={optimisticMessages}
            />
            <ChatMessageSend onMessageSend={addOptimisticMessage}/>
        </>
    )
}
