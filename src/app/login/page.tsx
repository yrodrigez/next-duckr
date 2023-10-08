import { AuthButtonServer } from "@/app/components/auth-button-server";

export default function Login () {

    return (
        <div className="grid place-content-center min-h-screen">
            <h1 className="font-bold text-xl mb-4 text-center">Login</h1>
            <AuthButtonServer/>
        </div>
    )
}
