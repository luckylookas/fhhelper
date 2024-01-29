import React from "react";

interface Props {
    onClick: () => void
    label: string
    className?: string
}

export const Button = ({label, onClick, className}: Props) =>
    <div className={`text-2xs bg-light hover:bg-dark hover:text-ctext p-1 px-1 cursor-pointer text-center ${className}`}
         onClick={onClick}>{label}
    </div>
