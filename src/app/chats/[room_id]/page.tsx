import {createServerComponentClient} from "@supabase/auth-helpers-nextjs";
import {cookies} from "next/headers";
import {Section} from "@/app/components/section-server";
import {revalidatePath} from "next/cache";
import {ChatRoom} from "@/app/components/chat/chat-room-client";

export const dynamic = 'force-dynamic'

async function updateReadAt(database: any, roomId: string, userId?: string) {
    if (!userId) throw new Error('User id is required')
    return database.from('chat_message_read')
        .update({read_at: new Date()})
        .filter('user_id', 'eq', userId)
        .filter('room_id', 'eq', roomId)
}

async function getRoomMembers(database: any, roomId: string) {
    const {data: members} = await database.from('chat_room_members')
        .select('id, member_from:created_at, users(*), room: chat_rooms(*)')
        .filter('room_id', 'eq', roomId)
    return members
}

async function getRoomMessages(database: any, roomId: string) {
    const {data: messages} = await database.from('chat_messages')
        .select('id, message, created_at, user:users(avatar_url, name, user_name, id)')
        .filter('room_id', 'eq', roomId)
        .order('created_at', {ascending: false})
        .range(0, 50)

    return messages
}

export type ChatMessage = {
    id: string
    message: string
    user: ChatMember
    created_at: string
}

export type ChatMember = {
    id: string
    name: string
    user_name: string
    avatar_url: string
    created_at: string
    last_modified: string
    isOnline?: boolean
}

export type ChatRoom = {
    id: string
    name: string
    owner_id: string
    members: ChatMember[]
    messages: ChatMessage[]
}

export default async function Page({
                                       params
                                   }: { params: { room_id: string } }) {

    const database = createServerComponentClient({cookies})
    const {data: {session}} = await database.auth.getSession()

    const currentUserId = session?.user?.id

    const [members, messages] = await Promise.all([
        getRoomMembers(database, params.room_id),
        getRoomMessages(database, params.room_id),
        updateReadAt(database, params.room_id, currentUserId)
    ])

    const room: ChatRoom = {
        members: members.map(({users}: any) => ({
            ...users
        })),
        messages,
        ...members?.[0]?.room
    }

    if (!members) {
        return (
            <Section className="overflow-hidden flex justify-center items-center">
                Error loading chat room please try again later
            </Section>
        )
    }

    if (!session || !currentUserId) {
        return (
            <Section className="overflow-hidden flex justify-center items-center">
                Please login to view this page
            </Section>
        )
    }

    return (
        <Section className="flex flex-col pb-[65px] md:pb-0">
            <ChatRoom
                currentUserId={currentUserId}
                room={room}
            />
        </Section>
    )
}
