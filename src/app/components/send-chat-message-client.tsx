'use client'
import {useContext, useEffect, useRef, useState} from "react";
import {experimental_useFormStatus as useFormStatus} from "react-dom";
import {IconLoader2, IconSend} from "@tabler/icons-react";
import {SessionContext} from "@/app/providers";

export function ChatMessageSend({
                                    onMessageSend,
                                }: { onMessageSend: Function }) {

    // @ts-ignore
    const {sessionContext} = useContext(SessionContext)
    const {user} = sessionContext

    const {pending} = useFormStatus()
    const alreadySent = useRef(false)
    const inputTextRef = useRef<HTMLInputElement>(null)
    const [content, setContent] = useState('')

    useEffect(() => {
        inputTextRef.current?.focus()
        if (!inputTextRef.current) return

        if (!pending && alreadySent.current) {
            alreadySent.current = false
            inputTextRef.current.value = ''
            return
        }

        alreadySent.current = pending
    }, [pending])

    return (
        <div className="w-full flex gap-2 px-2 py-1">
            <input
                onChange={e => setContent(e.target.value)}
                ref={inputTextRef}
                disabled={pending}
                name="message"
                autoComplete="off"
                type="text"
                className="flex-1 bg-gray-500 rounded-full p-3 text-white"
                placeholder="Type a message"
            />
            <button className="flex gap-1 bg-sky-500 rounded-full p-3" onClick={
                () => {
                    onMessageSend({
                        user,
                        message: content,
                        created_at: new Date().toISOString()
                    })
                    setContent('')
                    inputTextRef.current?.focus()
                }}>
                {pending ? <IconLoader2 className="animate-spin w-6 h-6"/> : <IconSend className="w-6 h-6"/>}
            </button>
        </div>
    )
}
