import { useCurrentZone } from "./global"

const App = () => {
    const currentZone: { location: string, timeInZone: number } = useCurrentZone()

    if (!currentZone) {
        return <>Change zone to start plugin.</>
    }

    if (currentZone.location.includes("Hideout")) {
        return <>Time wasted in hideout {currentZone.timeInZone / 1000} seconds, get back to mapping!</>
    }

    return (
        <>In {currentZone.location}, good job!</>
    )
}

export default App
