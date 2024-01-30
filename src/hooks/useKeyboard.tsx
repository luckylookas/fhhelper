import {useCallback, useEffect} from "react";


export interface Handler {
    keys: string[]
    action: (() => Promise<any>)[]
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



            const handler = handlers.find(handler => (handler.keys.includes(key)|| handler.keys.includes(keyFull)))
                if (handler) {
                    event.stopPropagation()
                    event.preventDefault()
                    handler.action[alt ? 1 : 0]().catch(console.log)
                }
    }, [handlers, active])

    useEffect(() => {
        document.onkeydown = null
        document.onkeydown = handler;
        return () => {
            document.onkeydown = null
        }
    }, [handler])




}