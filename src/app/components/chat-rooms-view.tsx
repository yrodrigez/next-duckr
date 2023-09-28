'use client'
import Link from "next/link";
import {ChatRoomTitle} from "@/app/components/chat-room-title";



export const RoomView = ({
                      room
                  }: { room: any, currentUser?: any }) => {

    const members = room.members.map(({users: user}: any) => user)

    return (
        <Link href={`/chats/${room.id}`}>
            <ChatRoomTitle members={members} roomName={room.name}/>
        </Link>
    )
}

export function ChatRoomsView({
                                  rooms,
                                  currentUser
                              }: { rooms?: any, currentUser?: any }) {

    if (!rooms) {
        return <div className="h-screen flex align-middle justify-center">
            <p className="self-center text-white font-bold text-xl">Start chatting with people!</p>
        </div>
    }

    return rooms?.map((room: any) => <RoomView key={room?.id} room={room} currentUser={currentUser}/>)

}
