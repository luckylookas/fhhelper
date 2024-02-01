import React, {useEffect, useRef, useState} from "react";
import {Button} from "./button";
import {Level} from "../model/model";
import {useKeyboard} from "../hooks/useKeyboard";

interface Props {
    close: () => void
    currentLevel?: Level
    currentSession: string
    trigger: (sessionId: string, level: Level) => void
}

const SCENARIO = 1
const LEVEL = 2
const DONE = 0

export const SwitchSession = ({close, currentSession, currentLevel, trigger}: Props) => {
    const [sessionId, setSessionId] = useState<string>()
    const [level, setLevel] = useState<Level>(currentLevel ? currentLevel : 0 as Level)

    const [phase, setPhase] = useState(SCENARIO)

    const scenarioRef = useRef(null)

    useEffect(() => {
        if (phase === DONE) {
            if (sessionId) {
                trigger(sessionId, level ?? 0);
            }
            close()
        }
    }, [phase, close, sessionId, level, trigger])

    useKeyboard([
        {
            keys: ['z'],
            action: [() => new Promise(() => {
                setPhase(prev => (prev + 1) % 3)
            }), () => new Promise(() => {
                setPhase(prev => prev - 1)
            })]
        },
        {
            keys: ['k'],
            action: [() => new Promise(() => {
                setLevel(currentLevel ?? 0)
                setSessionId(currentSession)
                setPhase(DONE)
            }), () => new Promise(() => {
                setLevel(currentLevel ?? 0)
                setSessionId(currentSession)
                setPhase(DONE)
            })]
        },
    ], true)

    return <div className={`absolute w-screen h-screen bg-transparent flex justify-center items-center z-20`}>
        <div className={`absolute w-full h-full bg-dark opacity-90  flex justify-center items-center z-20`}>
        </div>
        <div className={`bg-main w-1/2 h-1/2 z-30 flex-col flex p-5 gap-2`}>
            {phase === SCENARIO &&
                <div className={`flex basis-full flex-col justify-center content-center gap-2`}>
                    <label className={'text-xs'}>scenario</label>
                    <input autoFocus={phase === SCENARIO} ref={scenarioRef} type={"number"}
                           className='basis-1/8 text-xs border-text border-solid border-b-2 rounded-none'
                           placeholder='scenario' value={sessionId} onChange={(e) => {
                        setSessionId(e.target.value)
                    }}/>
                </div>
            }
            {phase === LEVEL &&
                <div className={`flex basis-full flex-col justify-center content-center gap-2`}>
                    <label className={'text-xs'}>Scenario {sessionId}</label>
                    <label className={'text-xs'}>level</label>
                    <input className={`max-h-0`} autoFocus={phase === LEVEL} type={"number"} onKeyUp={(e) => {
                        setLevel(parseInt(e.key, 10)%8 as Level)
                    }}/>
                    <div className={`bg-inherit flex-row flex justify-between`}>
                        {[0, 1, 2, 3, 4, 5, 6, 7].map(it => <Button
                            className={`text-sm px-3 ${level === it ? 'bg-highlight text-main' : ''}`} label={`${it}`}
                            onClick={() => {
                                setLevel(it as Level)
                            }}/>)}
                    </div>
                </div>
            }

        </div>
    </div>
}

