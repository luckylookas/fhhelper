import React from "react";

interface Props {
    round?: number
    session: string
    back: () => void
    advanceRound: () => void

}

export const RoundTracker = ({round, back, advanceRound, session}: Props) => {
    return <div id='round' className='m-2 flex flex-col h-8 w-full justify-center content-around'>
        <div className={`pt-2 text-sm w-full text-center`}>{`scenario ${session}`}</div>
        <div className={`pt-2 text-sm w-full text-center`}>{round ? `round ${round} ` : `setup`}</div>
    </div>
}