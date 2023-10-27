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
                <div>Enter your JWT</div>
                <input type="password"
                       className="px-1 py-0.5 bg-secondary-surface border rounded-lg focus:outline-none focus:ring focus:border-blue-300"
                       onChange={(e) => setInputValue(e.target.value)}
                       value={inputValue}/>
                <button onClick={handleSet}>Set</button>
            </div>
        </div>
    )
}