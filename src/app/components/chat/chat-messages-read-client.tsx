import {type ReactNode} from "react";
import {createClientComponentClient} from "@supabase/auth-helpers-nextjs";
import {useContext, useEffect, useState} from "react";
import {SessionContext} from "@/app/providers";
import {useRouter} from "next/navigation";

type Filters = {
    room_id?: string
    user_id?: string
    unreadOnly?: boolean
}

type UnreadChatMessagesProps = {
    children: (unreadMessages: any[] | null) => ReactNode
    filters?: Filters;
}

export function ChatMessagesRead({
                                     children,
                                     filters
                                 }: UnreadChatMessagesProps) {
    const database = createClientComponentClient();
    const {sessionContext: session}: any = useContext(SessionContext);
    const [unreadMessages, setUnreadMessages] = useState<any>([]) // or appropriate initial state

    useEffect(() => {
        let query = database.from('chat_message_read')
            .select('*')

        if (filters?.room_id) {
            query = query.filter('room_id', 'eq', filters.room_id)
        }

        if (filters?.user_id) {
            query = query.filter('user_id', 'eq', filters.user_id)
        }

        if (filters?.unreadOnly) {
            query = query.filter('read_at', 'is', null)
        }

        query.then(({data}: any) => {
            setUnreadMessages(data)
        })

        const unreadMessagesChannel = database
            .channel('realtime unreadMessages')
            .on(
                'postgres_changes',
                {
                    event: '*',
                    schema: 'public',
                    table: 'chat_message_read',
                },
                ({new: newData}: any) => {
                    setUnreadMessages((prevMessages: any) => [...prevMessages || []]
                        .map((msg: any) => msg.id === newData.id ? {...msg, ...newData} : msg)
                        .filter((msg: any) => {
                            if (filters?.room_id && msg.room_id !== filters?.room_id) return false
                            if (filters?.user_id && msg.user_id !== filters?.user_id) return false
                            return !(filters?.unreadOnly && msg.read_at !== null)
                        }))
                }
            )
            .subscribe()

        return () => {
            database.removeChannel(unreadMessagesChannel)
        }
    }, [session?.user?.id, filters, database])

    return children(unreadMessages)
}
