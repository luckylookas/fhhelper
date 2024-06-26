import React from "react";

export const PageContainer = ({children, theme}: {children?: React.JSX.Element, theme: string}) => {
    return <div data-theme={theme} className='h-screen z-0'>
        {children}
    </div>
}