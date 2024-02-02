import {useCallback, useEffect} from "react";


export interface Handler {
    keys: string[]
    action: (() => Promise<any> | null)[]
}

export const useKeyboard  = (handlers: Handler[], active: boolean) => {

    const handler = useCallback(
        (event: KeyboardEvent) => {
            if (event.isComposing || !event.code || !active) {
                return;
            }
            const alt = event.altKey
            const key = event.code.substring(event.code.length-1).toLowerCase()
            const keyFull = event.code.toLowerCase()

            handlers.filter(handler => (handler.keys.includes(key)|| handler.keys.includes(keyFull)))
                .filter(handler => (alt && handler.action[1] !== null) || (!alt && handler.action[0] !== null))
                .map(handler => handler.action[alt ? 1 : 0])
                .forEach(action => {
                    event.stopPropagation()
                    event.preventDefault()
                    action()!.catch(console.log)
                })

    }, [handlers, active])

    useEffect(() => {
        document.onkeydown = null
        document.onkeydown = handler;
        return () => {
            document.onkeydown = null
        }
    }, [handler])




}