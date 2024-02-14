import {Element} from "./Element";
import React from "react";
import {FirebaseSession} from "../model/model";

interface Props {
    earth?: number,
    wind?: number,
    fire?: number,
    ice?: number,
    light?: number,
    dark?: number
    setElement: (elements: Partial<FirebaseSession>) => void
}

export const Elements = ({earth, wind, fire, ice, light, dark, setElement}: Props) => {
    return <div id='elements' className='p-2 flex flex-row gap-2 w-full justify-center content-around'>
        <Element value={earth} onClick={async () => {
            await setElement({earth: earth ? 0 : 2})
        }} colorClass={'elementearth'} />
        <Element value={wind} onClick={async () => {
            await setElement({wind: wind ? 0 : 2})
        }} colorClass={'elementwind'} />
        <Element value={fire} onClick={async () => {
            await setElement({fire: fire ? 0 : 2})
        }} colorClass={'elementfire'} />
        <Element value={ice} onClick={async () => {
            await setElement({ice: ice ? 0 : 2})
        }} colorClass={'elementice'} />
        <Element value={light} onClick={async () => {
            await setElement({light: light ? 0 : 2})
        }} colorClass={'elementlight'} />
        <Element value={dark} onClick={async () => {
            await setElement({dark: dark ? 0 : 2})
        }} colorClass={'elementdark'} />
    </div>
}