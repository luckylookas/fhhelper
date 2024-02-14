import React, {useEffect, useMemo, useState} from 'react';
import './App.css';
import {useFirebase} from "./hooks/useFirebase";
import {useKeyboard} from "./hooks/useKeyboard";
import {Login} from "./components/login";
import {SwitchSession} from "./components/SwitchSession";
import {TownPage} from "./pages/TownPage";
import {ScenarioPage} from "./pages/ScenarioPage";
import {useTheme} from "./hooks/useTheme";
import {PageContainer} from "./hooks/PageContainer";

function App() {
    const townName = useMemo(() => {
        return new URLSearchParams(window.location.search).get("town") ?? "lastChristmateers"
    }, [])

    const {firebaseApp} = useFirebase();
    const {seethrough, theme} = useTheme();

    const [phase, setPhase] = useState<'login' | 'scenario' | 'town' | 'switchSession'>('scenario')

    const commonHandlers = useMemo(() => [
        {
            matcher: (e: KeyboardEvent) => e.key.toLowerCase() === 'backspace',
            action: () => {
                switch (phase) {
                    case "town":
                        return Promise.resolve(setPhase('switchSession'))
                    default:
                        return Promise.resolve(setPhase('town'))
                }
            }
        }], [phase])

    useEffect(() => {
        if (firebaseApp && phase === 'login') {
            setPhase('town')
        }
    }, [firebaseApp, phase])

    useKeyboard(commonHandlers, true)

    const route = useMemo(() => {
        if (!firebaseApp) {
            return <Login/>
        }

        switch (phase) {
            case 'login':
                return <Login/>
            case "scenario":
                return <ScenarioPage commonKeyBoardControls={commonHandlers} theme={{seethrough}}
                                     firebaseApp={firebaseApp}/>
            case "town":
                return <TownPage commonKeyBoardControls={commonHandlers} firebaseApp={firebaseApp} townName={townName}/>
            case "switchSession":
                return <SwitchSession close={() => setPhase('scenario')}/>
        }
    }, [phase, seethrough, firebaseApp, townName])

    return <PageContainer theme={theme}>{route}</PageContainer>
}

export default App;
