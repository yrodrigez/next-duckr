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
        <div className="flex flex-col justify-end h-full overflow-hidden">
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
                className={className || 'flex gap-3 p-5 overflow-auto scroll-smooth flex-col'}>

                {children}

            </div>
        </div>
    )
}

const PureContainer = ({children}: { children?: any }) => {
    return (
        <>
            {children}
        </>
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
            }, []).sort((x: any, y: any) => {
                return new Date(x.date).getTime() - new Date(y.date).getTime()
            }).map(({
                        date,
                        messages
                    }: any) => {

                return (
                    <PureContainer key={new Date(date).getTime()}>
                        <div className="flex flex-col gap-1 items-center">
                            <span
                                className="text-gray-300 text-xs text-center bg-gray-500 rounded-full px-3 py-1">{formatGroupDate(date)}</span>
                        </div>
                        {
                            messages.sort((x: any, y: any) => {
                                return new Date(x.created_at).getTime() - new Date(y.created_at).getTime()
                            }).map(({
                                        user,
                                        message,
                                        created_at
                                    }: any) => (
                                <div key={created_at}
                                     className={`flex flex-col gap-1 ${currentUserId === user?.id ? 'ml-auto' : ''} self-baseline flex flex-col`}>
                                    <div
                                        className={`flex gap-2  ${/*currentUserId === user?.id ? 'flex-row-reverse' :*/ 'flex-row'}`}>
                                        {currentUserId !== user?.id && user?.avatar_url &&
                                          <img src={user?.avatar_url} className="w-8 h-8 rounded-full self-end"
                                               alt={`${user.user_name} avatar`}/>}
                                        <div
                                            className={`px-6 py-2 ${currentUserId !== user?.id ? 'bg-sky-500' : 'bg-gray-500'} rounded-t-xl ${currentUserId !== user?.id ? 'rounded-br-2xl' : 'rounded-bl-2xl'} h-full flex flex-col`}>
                    <span className="text-gray-300 text-xs">
                        {`${currentUserId === user?.id ? 'you' : `@${user?.user_name}`}`}
                    </span>
                                            <p className="text-white max-w-[350px] break-all">{message}</p>
                                            <span
                                                className={`text-gray-300 text-xs text-right`}>{formattedDate(created_at)}</span>
                                        </div>
                                    </div>
                                </div>

                            ))

                        }
                    </PureContainer>
                )
            })
            }
        </PinScrollToBottom>
    )
}
