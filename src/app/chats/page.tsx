import {IconMessagePlus} from "@tabler/icons-react";
import {createServerComponentClient} from "@supabase/auth-helpers-nextjs";
import {Database} from "@/app/types/database";
import {cookies} from "next/headers";
import {ChatRoomsView} from "@/app/components/chat-rooms-view";

export default async function Chats() {
    const database = createServerComponentClient<Database>({cookies})
    const {data: {session}} = await database.auth.getSession()
    const {data: rooms} = await database.from('chat_rooms')
        .select('*, members:chat_room_members(users(*))')

    return (
        <section className="border-x border-white/30 max-w-[600px] w-screen h-full py-6">
            <div className="w-[100%] overflow-auto border-white/30 border-t">
                <ChatRoomsView rooms={rooms} currentUser={session?.user}/>
            </div>
            <div
                className="fixed md:bottom-4 bottom-20 md:right-40 lg:right-60 xl:right-96 2xl:right-unit-xl right-6 z-10">
                <button className="
                    rounded-full
                    bg-sky-500
                    p-3
                "><IconMessagePlus size={30} color="white"/></button>
            </div>
        </section>
    )
}
