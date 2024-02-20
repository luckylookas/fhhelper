import React, {useState} from "react";
import {useFirebase} from "../hooks/useFirebase";

export const Login = () => {
    const [email, setEmail] = useState<string>('')
    const [password, setPassword] = useState<string>('')
    const [bemail, setbEmail] = useState<string>('')
    const [bpassword, setbPassword] = useState<string>('')

    const {error} = useFirebase(email, password);

    return <div id='loader' className='w-screen h-screen'>
        <div
            className='border-white bg-white border-red border-purple border-green border-blue bg-red bg-green bg-blue bg-purple h-0 bg-elementearth bg-elementice bg-elementfire bg-elementdark bg-elementlight bg-elementwind shadow-elementearth shadow-elementice shadow-elementfire shadow-elementdark shadow-elementlight shadow-elementwind '></div>
        <div className='w-screen gap-2 h-screen flex flex-col p-2 z-10 justify-center items-center'>
            <input className='basis-1/8 text-xs border-text border-solid border-b-2 rounded-none'
                   placeholder='email'
                   onChange={e => setbEmail(e.target.value)}/>
            <input type={'password'}
                   className='basis-1/8 text-xs border-text border-solid border-b-2 rounded-none'
                   placeholder='password' onChange={e => setbPassword(e.target.value)}/>
            <div
                className={`mx-80 basis-1/8 text-xs bg-light hover:bg-dark hover:text-ctext p-2 text-center px-5 cursor-pointer`}
                onClick={() => {
                    setPassword(bpassword)
                    setEmail(bemail)
                }}>login
            </div>
            <div
                className={`basis-1/8 mx-80 text-center text-2xs text-red ${error ? '' : 'h-0'}`}>{error ? error : ''}</div>
        </div>
    </div>
}

