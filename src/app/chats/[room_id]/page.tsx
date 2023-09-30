import {createServerComponentClient} from "@supabase/auth-helpers-nextjs";
import {cookies} from "next/headers";
import {Section} from "@/app/components/section-server";
import {ChatRoomTitle} from "@/app/components/chat-room-title";
import {ChatMessages} from "@/app/components/chat-messages-client";
import {type Database} from "@/app/types/database";
import {ChatMessageSend} from "@/app/components/send-chat-message-client";
import {revalidatePath} from "next/cache";

export const dynamic = 'force-dynamic'

async function sendMessage(message?: string, roomId?: string) {
    'use server'
    if (!message || !roomId) return
    const database = createServerComponentClient({cookies})
    const {data: {user}} = await database.auth.getUser()
    if (!user) return
    const payload = {
        message,
        user_id: user.id,
        room_id: roomId
    }
    return database.from('chat_messages').insert(payload)
}

export default async function Page({
                                       params
                                   }: { params: { room_id: string } }) {

    const database = createServerComponentClient<Database>({cookies})
    const {data: members} = await database.from('chat_room_members')
        .select('id, member_from:created_at, users(*), room: chat_rooms(*)')
        .filter('room_id', 'eq', params.room_id)
    const {data: messages} = await database.from('chat_messages')
        .select('id, message, created_at, user:users(avatar_url, name, user_name, id)')
        .filter('room_id', 'eq', params.room_id)
        .order('created_at', {ascending: true})

    const {data: {session}} = await database.auth.getSession()

    const currentUserId = session?.user?.id

    if (!members) {
        return (
            <Section className="overflow-hidden flex justify-center items-center">
                Error loading chat room please try again later
            </Section>
        )
    }

    return (
        <Section className="w-screen flex flex-col h-screen pb-[65px] md:pb-0">
            <ChatRoomTitle
                members={members?.map(({users: user}) => user)}
                roomName={members?.[0]?.room?.name || 'Chat'}
            />
            <ChatMessages currentUserId={currentUserId} messages={messages}/>
            <div>
                <form action={async (formData: FormData) => {
                    'use server'
                    const message = formData.get('message')?.toString()
                    await sendMessage(message, params.room_id)

                    revalidatePath(`/chats/${params.room_id}`)
                }} className="flex gap-2 p-3">
                    <ChatMessageSend/>
                </form>
            </div>
        </Section>
    )
}
