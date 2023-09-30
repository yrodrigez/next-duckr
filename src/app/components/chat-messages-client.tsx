'use client'
import React, {experimental_useOptimistic as useOptimistic, useEffect, useRef, useState} from "react";
import moment from "moment";
import {createClientComponentClient} from "@supabase/auth-helpers-nextjs";

import {useRouter} from "next/navigation";

const PinScrollToBottom = ({
                               className,
                               children
                           }: { className?: string, children?: any }) => {
    const ref = useRef<HTMLDivElement>(null)
    const [scrolledUp, setScrolledUp] = useState(false)

    const scroll = (ref: React.RefObject<HTMLDivElement>) => {
        ref.current?.scrollTo(0, ref.current?.scrollHeight)
    }

    useEffect(() => {
        const {current} = ref
        if (!current) return

        if (scrolledUp) return
        scroll(ref)
    })

    return (
        <div
            onScroll={(e) => {
                const {
                    scrollTop,
                    scrollHeight,
                    clientHeight
                } = e.target as HTMLDivElement
                setScrolledUp((scrollTop + clientHeight) < scrollHeight)
            }}
            ref={ref}
            className={className || 'flex flex-col gap-3 p-5 overflow-auto flex-grow scroll-smooth'}>
            {children}
        </div>
    )
}

export function ChatMessages({
                                 messages,
                                 currentUserId,
                             }: {
    messages?: any, currentUserId?: any
}) {
    const formatGroupDate = (date: any) => moment(date).format(moment(date).isSame(moment(), 'year') ? 'MMMM, DD' : 'DD, MMMM YYYY')
    const isSameDay = (date1: any, date2: any) => moment(date1).isSame(moment(date2), 'day')
    const formattedDate = (date: any) => moment(date).format(moment().diff(moment(date), 'days') > 0 ? 'MMM DD, YYYY' : 'HH:MM')

    return (
        <PinScrollToBottom>
            {messages?.reduce((arr: any[], current: any) => {
                // groups the messages by day. return an object {messages, date}
                const last = arr[arr.length - 1]
                if (!last || !isSameDay(last.date, current.created_at)) {
                    arr.push({
                        date: current.created_at,
                        messages: [current]
                    })
                } else {
                    last.messages.push(current)
                }

                return arr
            }, []).map(({
                            date,
                            messages
                        }: any) => {

                return (
                    <>
                        <div className="flex flex-col gap-1 items-center">
                            <span className="
                            text-gray-300 text-xs text-center
                            bg-gray-500 rounded-full
                            px-3 py-1
                            ">{formatGroupDate(date)}</span>
                        </div>
                        {
                            messages.map(({
                                              user,
                                              message,
                                              created_at
                                          }: any) => (<div key={created_at}
                                                           className={`flex flex-col gap-1  ${currentUserId === user?.id ? 'self-end' : 'self-start'} flex flex-col`}>
                                    <div
                                        className={`flex gap-2 flex-row ${currentUserId === user?.id ? 'flex-row-reverse' : ''}`}>
                                        {currentUserId !== user?.id && user?.avatar_url &&
                                          <img src={user?.avatar_url} className="w-8 h-8 rounded-full self-end"
                                               alt={`${user.user_name} avatar`}/>}
                                        <div
                                            className={`px-3 py-2 ${currentUserId !== user?.id ? 'bg-green-700' : 'bg-gray-500'} rounded h-full flex flex-col`}>
                    <span
                        className="text-gray-300 text-xs">{`${currentUserId === user?.id ? 'you' : `@${user?.user_name}`}`}</span>
                                            <p className="text-white max-w-[350px]">{message}</p>
                                            <span
                                                className={`text-gray-300 text-xs text-right`}>{formattedDate(created_at)}</span>
                                        </div>
                                    </div>
                                </div>

                            ))

                        }
                    </>
                )
            })
            }
        </PinScrollToBottom>
    )
}
