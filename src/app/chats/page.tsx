import {createServerComponentClient} from "@supabase/auth-helpers-nextjs";
import {Database} from "@/app/types/database";
import {cookies} from "next/headers";
import {ChatRoomsView} from "@/app/components/chat/chat-rooms-view";
import {CreateNewChat} from "@/app/components/create-new-chat";

export const dynamic = 'force-dynamic'

export default async function Chats() {
    const database = createServerComponentClient<Database>({cookies})
    const {data: {session}} = await database.auth.getSession()
    const {data: rooms} = await database.from('chat_rooms')
        .select('*, members:chat_room_members(users(*))')

    return (
        <section
            className="border-x border-white/30 max-w-[600px] w-screen h-full flex flex-col relative pb-[65px] md:pb-0">
            <div className="w-[100%] overflow-auto border-white/30 border-t flex-grow">
                <ChatRoomsView rooms={rooms} currentUser={session?.user}/>
            </div>
            <CreateNewChat/>
        </section>
    )
}
