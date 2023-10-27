import {useState} from "react";
import {BehaviorSubject} from "rxjs";
import {bind} from "@react-rxjs/core";

const jwtSubject$ = new BehaviorSubject<string | null>(null)
const [useJwt] = bind(jwtSubject$, null)

export function AuthGuard({children}) {
    const jwt = useJwt()

    if (!jwt) {
        return <LoginPage/>
    }

    return <>{children}</>
}

export function LoginPage() {
    const jwt = useJwt()
    const [inputValue, setInputValue] = useState(jwt)

    function handleSet() {
        jwtSubject$.next(inputValue)
    }

    return (
        <div className="min-h-screen flex items-center justify-center text-primary-text">
            <div className="flex flex-col gap-2">
                <div className="text-lg font-semibold">Login</div>
                <div className="text-sm">Enter your PoeStack token. <a
                    className="text-primary-accent text-sm"
                    href="https://poestack.com/poe-stack/development">
                    Get Token
                </a></div>

                <input type="password"
                       placeholder="Token"
                       className="px-2 py-0.5 bg-input-surface rounded-lg shadow-md border-0 focus:outline-none focus:ring focus:border-primary-accent"
                       onChange={(e) => setInputValue(e.target.value)}
                       value={inputValue}/>
                <button
                    className="bg-primary-accent px-1 py-0.5 rounded-lg"
                    onClick={handleSet}>Login
                </button>
            </div>
        </div>
    )
}