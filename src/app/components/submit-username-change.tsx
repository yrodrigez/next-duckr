'use client'
import {useEffect, useRef, useState} from "react";
import {experimental_useFormStatus as useFormStatus} from "react-dom"
import {useRouter} from "next/navigation";
import {createClientComponentClient} from "@supabase/auth-helpers-nextjs";

export function SubmitUsernameChange() {
    const {pending} = useFormStatus()
    const [wasSent, setWasSent] = useState(false)
    const router = useRouter()
    useEffect(() => {
        if (!pending && wasSent) {
            const database = createClientComponentClient()
            database.auth.signOut().then(router.refresh)

        }
        setWasSent(pending)
    }, [pending, wasSent]);
    return (
        <button
            type="submit"
            className="rounded-full bg-white text-black px-3 py-2.5 text-sm focus:outline-none focus:ring-4 focus:ring-white/20"
            disabled={pending}
        >
            {pending ? 'Updating...' : 'Update'}
        </button>
    )
}
