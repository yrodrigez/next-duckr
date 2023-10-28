import {useEffect, useState} from "react";
import {throttle} from "@/lib/util/throttle";

export type UseTabFocusOptions = {
    onFocus?: () => void,
    onBlur?: () => void
}

/**
 * Hook to detect if the tab is focused or not
 * @param onFocus  Callback when the tab is focused
 * @param onBlur  Callback when the tab is blurred
 */
export function useTabFocus({
                                onFocus,
                                onBlur
                            }: UseTabFocusOptions = {}): boolean {
    if (typeof window === 'undefined') return false
    const [isTabFocused, setIsTabFocused] = useState(!window?.document?.hidden);
    useEffect(() => {
        const _onFocus = throttle(() => {
            if (onFocus) onFocus()
            setIsTabFocused(true)
        }, 300)
        window.addEventListener('focus', _onFocus)

        const _onBlur = throttle(() => {
            if (onBlur) onBlur()
            setIsTabFocused(false)
        }, 300)
        window.addEventListener('blur', _onBlur)

        return () => {
            if (onFocus) window.removeEventListener('focus', _onFocus);
            if (onBlur) window.removeEventListener('blur', _onBlur);
        }
    }, [])

    return isTabFocused
}
