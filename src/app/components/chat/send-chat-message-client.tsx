'use client'
import {useContext, useEffect, useRef, useState} from "react";
import {IconSend} from "@tabler/icons-react";
import {SessionContext} from "@/app/providers";
import {v4 as uuid} from 'uuid';



export function ChatMessageSend({
                                    onMessageSend,
                                }: { onMessageSend: Function }) {

    // @ts-ignore
    const {sessionContext} = useContext(SessionContext)
    const {user} = sessionContext
    const inputTextRef = useRef<HTMLInputElement>(null)
    const [content, setContent] = useState('')

    useEffect(() => {
        inputTextRef.current?.focus()

    })

    return (
        <div className="w-full flex gap-2 px-2 py-1 bg-transparent">
            <input
                onChange={e => setContent(e.target.value)}
                ref={inputTextRef}
                name="message"
                autoComplete="off"
                type="text"
                className="flex-1 bg-gray-500 rounded-full p-3 text-white"
                placeholder="Type a message"
                value={content}
                onKeyDown={(e) => {
                    if (e.key === 'Enter') {
                        e.preventDefault()
                        if (!content) return
                        onMessageSend({
                            id: uuid(),
                            user,
                            message: content,
                            created_at: new Date().toISOString()
                        })
                        setContent('')
                        inputTextRef.current?.focus()
                    }
                }}
            />
            <button
                className="flex gap-1 bg-sky-500 rounded-full p-3"
                type="submit"
                onClick={
                    () => {
                        if (!content) return
                        onMessageSend({
                            id: uuid(),
                            user,
                            message: content,
                            created_at: new Date().toISOString()
                        })
                        setContent('')
                        inputTextRef.current?.focus()
                    }}
            >
                <IconSend className="w-6 h-6 text-white"/>
            </button>
        </div>
    )
}
