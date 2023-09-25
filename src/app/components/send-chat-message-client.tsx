'use client'
import {useEffect, useRef, useState} from "react";
import {experimental_useFormStatus as useFormStatus} from "react-dom";

export function ChatMessageSend() {

    const {pending} = useFormStatus()
    const alreadySent = useRef(false)
    const inputTextRef = useRef<HTMLInputElement>(null)
    const [content, setContent] = useState('')
    useEffect(() => {
        if (!inputTextRef.current) return

        if (!pending && alreadySent.current) {
            alreadySent.current = false
            inputTextRef.current.value = ''
            return
        }

        alreadySent.current = pending
    }, [pending])

    return (
        <>
            <input
                onChange={e => setContent(e.target.value)}
                ref={inputTextRef}
                disabled={pending}
                name="message" type="text" className="flex-1 bg-gray-500 rounded-full p-3 text-white"
                placeholder="Type a message"/>
            <button className="bg-sky-500 rounded-full p-3" disabled={pending || !content}>
                Send
            </button>
        </>
    )
}
