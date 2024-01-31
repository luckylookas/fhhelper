import React from "react";

interface Props {
    round?: number
    back: () => void
    advanceRound: () => void

}

export const RoundTracker = ({round, back, advanceRound}: Props) => {
    return <div id='round' className='flex flex-row h-8 gap-2 w-full justify-center content-around'>
        <div
            className={` px-5 ${round ? 'cursor-pointer bg-light hover:bg-dark hover:text-ctext' : 'cursor-not-allowed bg-light'}`}
            onClick={back}>←
        </div>
        <div className={`pt-2 text-xs`}>{round ? `round ${round}` : `setup`}</div>
        <div className={`bg-light hover:bg-dark hover:text-ctext px-5 cursor-pointer`}
             onClick={advanceRound}>→
        </div>
    </div>
}