'use client'
import {createClientComponentClient} from "@supabase/auth-helpers-nextjs";
import {useContext, useEffect, useState} from "react";
import {type PostgrestSingleResponse} from "@supabase/supabase-js";
import {usePathname} from "next/navigation";
import {SessionContext} from "@/app/components/context-providers/session-context";

export type MessageReadEvent = {
    id: string
    room_id: string
    user_id: string
    read_at: string | null
    message_id: string
    created_at: string
    received_at: string | null
}

export function useChatMessagesRead() {
    const database = createClientComponentClient();
    const {sessionContext: session}: any = useContext(SessionContext);
    const [unreadMessages, setUnreadMessages] = useState<MessageReadEvent[]>([]); // or appropriate initial state
    const [debouncedUnreadMessages, setDebouncedUnreadMessages] = useState<MessageReadEvent[]>([]);
    const pathName = usePathname();

    useEffect(() => {
        const debounceTimer = setTimeout(() => {
            // path name changed is not a chat room
            if (!pathName.match(/\/chats\/[a-zA-Z0-9-]+/)) {
                setDebouncedUnreadMessages(unreadMessages);
            }
        }, 300);

        return () => {
            clearTimeout(debounceTimer);
        };
    }, [pathName, unreadMessages]);

    useEffect(() => {
        database.from('chat_message_read')
            .select('*, message:chat_messages(*,room:chat_rooms(id))')
            .order('created_at', {ascending: false})
            .range(0, 300)
            .then(({
                       data,
                       error
                   }: PostgrestSingleResponse<MessageReadEvent[]>) => {
                if (error) {
                    console.error(error);
                    return;
                }

                setUnreadMessages(data);
            });
    }, []);

    useEffect(() => {
        const unreadMessagesChannel = database
            .channel('realtime unreadMessages')
            .on('postgres_changes', {
                event: '*',
                schema: 'public',
                table: 'chat_message_read',
            }, ({
                    new: newData,
                    eventType
                }: any) => {
                setUnreadMessages((prevUnreadMessages: any) => {
                    if (eventType === 'DELETE') {
                        return (prevUnreadMessages || []).filter((msg: any) => msg.id !== newData.id);
                    }

                    if (eventType === 'UPDATE') {
                        return (prevUnreadMessages || []).map((msg: any) => {
                            if (msg.id === newData.id) {
                                return {...msg, ...newData};
                            }
                            return msg;
                        });
                    }
                    // INSERT
                    return [newData, ...(prevUnreadMessages || [])];
                })
            })
            .subscribe();

        return () => {
            database.removeChannel(unreadMessagesChannel);
        };
    }, [session?.user?.id]);

    return debouncedUnreadMessages;
}
