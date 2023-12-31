'use client'
import React, {useEffect, useRef, useState,} from "react";
import moment from "moment";
import {ChatMessageBubble} from "@/app/components/chat/chat-message-bubble";

const PinScrollToBottom = ({
                               className,
                               children
                           }: { className?: string, children?: any }) => {
    const ref = useRef<HTMLDivElement>(null)
    const [scrolledUp, setScrolledUp] = useState(false)
    const [isScrolling, setIsScrolling] = useState(false)

    const scroll = (ref: React.RefObject<HTMLDivElement>) => {
        setIsScrolling(true)
        ref.current?.scrollTo(0, ref.current?.scrollHeight)
        setTimeout(() => setIsScrolling(false), 300)
    }

    useEffect(() => {
        const {current} = ref
        if (!current) return

        if (scrolledUp && !isScrolling) return
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
            className={className || 'flex gap-3 p-5 overflow-auto scroll-smooth flex-col h-full'}>
            {children}
        </div>
    )
}

const GroupDate = ({date}: { date?: any }) => {
    const formatGroupDate = (date: any) => moment(date).format(moment(date).isSame(moment(), 'year') ? 'MMMM, DD' : 'DD, MMMM YYYY')
    return (
        <div className="flex flex-col gap-1 items-center">
            <span className="text-gray-300 text-xs text-center bg-gray-500 rounded-full px-3 py-1">
                {formatGroupDate(date)}
            </span>
        </div>
    )
}

const groupMessageByDate = (messages: any) => {
    const isSameDay = (date1: any, date2: any) => moment(date1).isSame(moment(date2), 'day')
    return (messages || []).reduce((arr: any[], current: any) => {
        // groups the messages by day. return an object {messages, date}
        const last = arr.find((item: any) => isSameDay(item.date, current.created_at))
        if (!last) {
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
    })
}

export function ChatMessages({
                                 messages,
                                 currentUserId,
                             }: {
    messages?: any, currentUserId?: any
}) {
    const groupedMessages = groupMessageByDate(messages)
    return (
        <PinScrollToBottom>
            {groupedMessages.map(({
                                      date,
                                      messages
                                  }: any) => {
                return (
                    <div className="w-full flex flex-col gap-3" key={new Date(date).getTime()}>
                        <GroupDate date={date}/>
                        {
                            messages.sort((x: any, y: any) => {
                                return new Date(x.created_at).getTime() - new Date(y.created_at).getTime()
                            }).map(({
                                        user,
                                        message,
                                        created_at,
                                        statuses
                                    }: any) => (
                                <ChatMessageBubble
                                    key={created_at}
                                    message={message}
                                    user={user}
                                    created_at={created_at}
                                    currentUserId={currentUserId}
                                    statuses={statuses}
                                />
                            ))

                        }
                    </div>
                )
            })
            }
        </PinScrollToBottom>
    )
}
