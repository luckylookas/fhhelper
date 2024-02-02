import React, { useMemo, useState} from 'react';
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

    const [phase, setPhase] = useState<'scenario' | 'town' | 'switchSession'>('town')

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

    useKeyboard([phaseHandler], true)

    if (!firebaseApp) {
        return <PageContainer theme={theme}><Login /></PageContainer>
    }


    switch (phase) {
        case "scenario":
            return <PageContainer theme={theme}><ScenarioPage commonKeyBoardControls={[themeHandler, phaseHandler]} theme={{seethrough}} firebaseApp={firebaseApp}/></PageContainer>
        case "town":
            return  <PageContainer theme={theme}><TownPage commonKeyBoardControls={[themeHandler, phaseHandler]} firebaseApp={firebaseApp} townName={townName}/></PageContainer>
        case "switchSession":
            return <PageContainer theme={theme}><SwitchSession close={() => setPhase('scenario')}/></PageContainer>
    }



}


export default App;
