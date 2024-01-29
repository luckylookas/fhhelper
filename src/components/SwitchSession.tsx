import React, {useState} from "react";
import {Button} from "./button";
import {Level} from "../model/model";

interface Props {
    close: () => void
    currentLevel?: Level
    currentSession: string
    trigger: (sessionId: string, level: Level) => void
}

export const SwitchSession = ({close, currentSession, currentLevel, trigger}: Props) => {
    const [sessionId, setSessionId] = useState<string>(currentSession)
    const [level, setLevel] = useState<Level>(currentLevel ? currentLevel : 0 as Level)

    return  <div className={`absolute w-screen h-screen bg-transparent flex justify-center items-center z-20`}>
        <div className={`absolute w-full h-full bg-dark opacity-90  flex justify-center items-center z-20`}>
        </div>
        <div className={`bg-main w-1/2 h-1/2 z-30 flex-col flex p-5 gap-2`}>
            <label className={'text-xs'}>scenario</label>
            <input className='basis-1/8 text-xs border-text border-solid border-b-2 rounded-none'
                   placeholder='scenario' value={currentSession} onChange={(e) => setSessionId(e.target.value)}/>
            <label className={'text-xs'}>level</label>

            <div className={`bg-inherit flex-row flex justify-between`}>
                {[0,1,2,3,4,5,6,7].map(it => <Button className={`text-sm px-3 ${level === it ? 'bg-highlight text-main' : ''}`} label={`${it}`} onClick={() => {setLevel(it as Level)}} />)}
            </div>
            <div className={`flex basis-full flex-col justify-end content-end gap-2`}>
                    <Button onClick={() => {
                        trigger(sessionId, level!);
                        close();
                    }} label={'ok'} />
                    <Button onClick={close} label={'cancel'} />
            </div>

        </div>
    </div>
}

