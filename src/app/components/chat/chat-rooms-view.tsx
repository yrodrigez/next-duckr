'use client'
import Link from "next/link";
import {ChatRoomTitle} from "@/app/components/chat/chat-room-title";
import {useEffect} from "react";
import {createClientComponentClient} from "@supabase/auth-helpers-nextjs";
import {useRouter} from "next/navigation";
import {useContext} from "react";
import {ChatMessagesReadContext} from "@/app/providers";

export const RoomView = ({
                             room
                         }: { room: any, currentUser?: any }) => {
    const members = room.members.map(({users: user}: any) => user)

    return (
        <Link href={`/chats/${room.id}`} className="flex content-between items-center">
            <ChatRoomTitle members={members} roomName={room.name} unreadCount={room.unreadMessages}/>
        </Link>
    )
}

export function ChatRoomsView({
                                  rooms,
                                  currentUser
                              }: { rooms?: any, currentUser?: any }) {

    const router = useRouter()
    const database = createClientComponentClient()
    const unreadMessages = useContext(ChatMessagesReadContext)

    useEffect(() => {
        const messagesChannel = database.channel('realtime messages')
            .on('postgres_changes', {
                event: 'INSERT',
                schema: 'public',
                table: 'chat_rooms'
            }, router.refresh).subscribe()

        return () => {
            database.removeChannel(messagesChannel)
        }

    }, [database, unreadMessages]);

    if (!rooms || !rooms?.length) {
        return (
            <div className="h-screen flex align-middle justify-center">
                <p className="self-center text-white font-bold text-xl">Start chatting with people!</p>
            </div>
        )
    }

    return (rooms || []).map((room: any) => {
        const roomUnreadMessages = unreadMessages?.filter((message: any) => message.room_id === room.id && message.user_id === currentUser?.id && !message.read_at)
        const roomWithUnreadMessages = {
            ...room,
            unreadMessages: roomUnreadMessages?.length || 0
        }

        return <RoomView key={roomWithUnreadMessages?.id} room={roomWithUnreadMessages} currentUser={currentUser}/>
    })
}
