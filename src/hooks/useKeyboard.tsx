import {useCallback, useEffect} from "react";


export interface Handler {
    keys: string[]
    action: (() => void)[]
}

export const useKeyboard  = (handlers: Handler[]) => {

    const handler = useCallback(
        (event: KeyboardEvent) => {
            if (event.isComposing || !event.code) {
                return;
            }
            const alt = event.altKey
            const key = event.code.substring(event.code.length-1).toLowerCase()
            const keyFull = event.code.toLowerCase()
            handlers.find(handler => (handler.keys.includes(key)|| handler.keys.includes(keyFull)))?.action[alt ? 1 : 0]()

    }, [handlers])

    useEffect(() => {
        document.onkeydown = null
        document.onkeydown = handler;
        return () => {
            document.onkeydown = null
        }
    }, [handler])




}