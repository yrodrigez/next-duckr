'use client'
import {createClientComponentClient} from "@supabase/auth-helpers-nextjs";
import {useContext, useEffect, useState} from "react";
import {SessionContext} from "@/app/providers";

type Filters = {
    room_id?: string
    user_id?: string
    unreadOnly?: boolean
}

type MessageReadEvent = {
    id: string
    room_id: string
    user_id: string
    read_at: string | null
    message_id: string
    created_at: string
    received_at: string | null
}

export function useChatMessagesRead(filters?: Filters) {
    const database = createClientComponentClient();
    const {sessionContext: session}: any = useContext(SessionContext);
    const [unreadMessages, setUnreadMessages] = useState<MessageReadEvent[]>([]); // or appropriate initial state

    useEffect(() => {
        let query = database.from('chat_message_read')
            .select('*, message:chat_messages(*,room:chat_rooms(id))');

        if (filters?.room_id) {
            query = query.filter('room_id', 'eq', filters.room_id);
        }

        if (filters?.user_id) {
            query = query.filter('user_id', 'eq', filters.user_id);
        }

        if (filters?.unreadOnly) {
            query = query.filter('read_at', 'is', null);
        }

        query.then(({data}: any) => {
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
                    old: oldData,
                    eventType
                }: any) => {
                setUnreadMessages((prevUnreadMessages: any) => {
                    return (prevUnreadMessages || []).reduce((acc: any, msg: any) => {
                        if (msg.id === newData.id) {
                            acc.push({...msg, ...newData})
                            return acc;
                        }
                        acc.push(msg);
                        return acc;
                    }, []);
                })
            })
            .subscribe();

        return () => {
            database.removeChannel(unreadMessagesChannel);
        };
    }, [session?.user?.id, filters]);

    return unreadMessages;
}
