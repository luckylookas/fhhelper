import {useCallback, useEffect} from "react";


export interface Handler {
    matcher: (e: KeyboardEvent) => boolean
    action: (e: KeyboardEvent) => Promise<any>
}

export const useKeyboard  = (handlers: Handler[], active: boolean) => {

    const handler = useCallback(
        (event: KeyboardEvent) => {
            if (event.isComposing || !active) {
                return;
            }

            const handler = handlers.find(handler => handler.matcher(event))
            if (handler) {
                event.stopPropagation()
                event.preventDefault()
                handler.action(event).catch(console.log)
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