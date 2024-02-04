import React, {useEffect, useMemo, useState} from 'react';
import './App.css';
import {useFirebase} from "./hooks/useFirebase";
import {Handler, useKeyboard} from "./hooks/useKeyboard";
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
    const {seethrough, theme, themeHandler} = useTheme();

    const [phase, setPhase] = useState<'login' | 'scenario' | 'town' | 'switchSession'>('login')

    const phaseHandler = useMemo(() => {
        return {
            keys: ['k'],
            action: [null, () =>
                new Promise(() => {
                    switch (phase) {
                        case "town":
                            setPhase('switchSession')
                            break;
                        default:
                            setPhase('town');
                            break;
                    }
                })
            ]
        } as Handler
    }, [phase])

    useEffect(() => {
        if (firebaseApp && phase === 'login') {
            setPhase('town')
        }
    }, [firebaseApp, phase])

    useKeyboard([phaseHandler], true)

    const route = useMemo(() => {
        if (!firebaseApp) {
            return <Login />
        }

        switch (phase) {
            case 'login':
                return <Login />
            case "scenario":
                return <ScenarioPage commonKeyBoardControls={[themeHandler, phaseHandler]} theme={{seethrough}} firebaseApp={firebaseApp}/>
            case "town":
                return  <TownPage commonKeyBoardControls={[themeHandler, phaseHandler]} firebaseApp={firebaseApp} townName={townName}/>
            case "switchSession":
                return <SwitchSession close={() => setPhase('scenario')}/>
        }
    }, [phase, themeHandler, phaseHandler, seethrough, firebaseApp, townName])

    return <PageContainer theme={theme}>{route}</PageContainer>
}

export default App;
