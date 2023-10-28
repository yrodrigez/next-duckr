'use client'

import { useEffect, useRef, useState } from "react"
import { useFormStatus } from "react-dom"

export function NewDuckTextArea({bgColor, placeholder, buttonText }: {bgColor?: string, placeholder?: string, buttonText?: string}) {
    const { pending } = useFormStatus()
    const alreadySent = useRef(false)
    const textAreaRef = useRef<HTMLTextAreaElement>(null)
    const [content, setContent] = useState('')

    useEffect(() => {
        if (!textAreaRef.current) return

        if (!pending && alreadySent.current) {
            alreadySent.current = false
            textAreaRef.current.value = ''
            return
        }

        alreadySent.current = pending
    }, [pending])



    return (
        <div className="flex flex-1 flex-col gap-y-4">
            <textarea
                onChange={e => setContent(e.target.value)}
                ref={textAreaRef} name="content" rows={2} className={`p-2 w-full text-2xl ${ bgColor ||'bg-black' } placeholder-gray-500 resize-none text-white`} placeholder={`${placeholder || 'What is happening?!'}`}></textarea>
            <button disabled={pending || !content} type="submit" className="bg-sky-300 font-bold rounded-full px-5 py-2 place-self-end text-sm disabled:opacity-40 disabled:pointer-events-none">
                {pending  ? 'Posting...' : 'Post'}
            </button>
        </div>
    )
}
