import {useEffect, useState} from 'react'
import * as fs from "fs";
function App() {
    const [count, setCount] = useState(0)
    const [body, setBody] = useState("")

    useEffect(() => {
        const x = fs.readFileSync("/Users/zach/workplace/poestack-sage/poestack-echo-plugins/example-plugin-ts/src/App.tsx").toString()
        console.log(x)
        setBody(x)
    }, []);


    return (
        <>
            <div className="card">
                <button onClick={() => setCount((count) => count + 1)}>
                    count is {count}
                </button>
                <p>
                    {body}
                </p>
            </div>
            <p className="read-the-docs">
                Click on the Vite and React logos to learn more
            </p>
        </>
    )
}

export default App
