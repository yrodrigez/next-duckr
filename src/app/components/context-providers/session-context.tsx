import { createContext, ReactNode, useEffect, useState } from "react";
import { createClientComponentClient, Session } from "@supabase/auth-helpers-nextjs";
import { useRouter, usePathname } from "next/navigation";

type SessionContextProviderProps = {
    children: ReactNode;
};

type SessionContextProviderState = {
    sessionContext?: Session;
    currentUser: Session['user'] | undefined;
    setSession: (session: Session | undefined ) => void;
};

export const SessionContext = createContext<SessionContextProviderState | undefined>(undefined);

export default function SessionContextProvider({ children }: SessionContextProviderProps) {
    const database = createClientComponentClient();
    const pathName = usePathname();
    const [statedSession, setStatedSession] = useState<Session | undefined >();
    const [currentUser, setCurrentUser] = useState<Session['user'] | undefined>(undefined);
    const {push} = useRouter()

    useEffect(() => {
        const initSession = async () => {
            const { data } = await database.auth.getSession();
            const session = data?.session || undefined
            const user = session?.user;
            setCurrentUser(user);

            const willRedirect = ![ '/login', '/login/update-user-name' ].includes(pathName);
            const redirectQuery = willRedirect ? `?redirectedFrom=${encodeURIComponent(pathName)}` : '';

            if (!user && pathName !== '/login') {
                push(`/login${redirectQuery}`);
            } else if (user && !user.user_metadata?.user_name && pathName !== '/login/update-user-name') {
                push(`/login/update-user-name?redirected=true${redirectQuery}`);
            }

            setStatedSession(session);
        };

        initSession();
    }, [pathName]);  // You may consider adding other dependencies if needed

    return (
        <SessionContext.Provider
            value={{
                sessionContext: statedSession,
                currentUser,
                setSession: setStatedSession
            }}>
            {children}
        </SessionContext.Provider>
    );
}
