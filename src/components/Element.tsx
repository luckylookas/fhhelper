import React from "react";

interface Props {
    value?: number
    onClick: () => void
    colorClass: string
}

export const Element = ({value, onClick, colorClass}: Props) => {
    return  <div id='earth'
                 className={`${!value ? 'opacity-10 max-h-10 min-h-10 max-w-10 max-h-10' : (value === 1 ? 'mt-4 max-h-6 min-h-6 max-w-6 max-h-6' : 'max-h-10 min-h-10 max-w-10 max-h-10')} shadow shadow-${colorClass} flex-auto bg-${colorClass} rounded-full`}
                 onClick={onClick} />
}