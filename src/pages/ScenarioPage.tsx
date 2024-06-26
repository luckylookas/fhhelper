import {Search} from "../components/search";
import {RoundTracker} from "../components/RoundTracker";
import {Elements} from "../components/Elements";
import {ELITE, Level, NORMAL, Rank} from "../model/model";
import React, {useCallback, useEffect, useMemo, useState} from "react";
import {FirebaseApp} from "@firebase/app";
import {useSession} from "../hooks/useSession";
import {colors} from "../model/contants";
import {useSearch} from "../hooks/useSearch";
import {Handler, useKeyboard} from "../hooks/useKeyboard";

interface Theme {
    seethrough: boolean
}

interface Props {
    theme: Theme
    firebaseApp: FirebaseApp
    commonKeyBoardControls: Handler[]
}

export const ScenarioPage = ({theme, firebaseApp, commonKeyBoardControls}: Props) => {
    const [sessionId, setSessionId] = useState<string>('')
    const [level, setLevel] = useState<Level>();
    const session = useSession(firebaseApp, sessionId);
    const [init, setInit] = useState(false)

    useEffect(() => {
        if (!localStorage.getItem("sessionId")) {
            localStorage.setItem("sessionId", 'lukas')
        }
        if (!localStorage.getItem("level")) {
            localStorage.setItem("level", '1')
        }
        setLevel(parseInt(localStorage.getItem("level") ?? '1', 10) % 8 as Level)
        setSessionId(localStorage.getItem("sessionId")!)
    }, [])
    useEffect(() => {
        if (session && level !== undefined && !init) {
            setInit(true)
            session.setLevel(level).catch(console.log)
        }
    }, [session, level, init])

    const search = useSearch(firebaseApp, session.list);

    const [chosenColor, setChosenColor] = useState<number>()
    const [chosenToken, setChosenToken] = useState<number>()
    const [chosenOperator, setChosenOperator] = useState<1 | -1 | undefined>(undefined)
    const [keyBoardActive, setKeyBoardActive] = useState(true)

    const addHandler = useCallback((rank: Rank, amount: number) => {
        if (chosenColor === undefined || chosenToken === undefined) {
            return Promise.resolve()
        }
        if ((!session.list[chosenColor].tokenHp[chosenToken - 1] || session.list[chosenColor].rank[chosenToken - 1] < rank) && amount > 0) {
            return session.createToken(session.list[chosenColor], rank, chosenToken)
        } else {
            if (rank === ELITE && amount < 0) {
                return session.setTokenHp(session.list[chosenColor], chosenToken, 0)
            }
            return session.setTokenHp(session.list[chosenColor], chosenToken, session.list[chosenColor].tokenHp[chosenToken - 1] + amount)
        }
    }, [session, chosenToken, chosenColor])

    const handlersv2 = useMemo(() => [
        ...commonKeyBoardControls,
        {
            matcher: (e: KeyboardEvent) => `-` === e.key.toLowerCase(),
            action: (e: KeyboardEvent) => {
                if (chosenColor === undefined || !chosenToken) {
                    return Promise.resolve();
                }

                if (chosenOperator && chosenOperator < 0) {
                    setChosenOperator(undefined);
                    return Promise.resolve(addHandler(ELITE, -1))
                }

                return Promise.resolve(setChosenOperator(-1));
            }
        },
        {
            matcher: (e: KeyboardEvent) => `+` === e.key.toLowerCase(),
            action: (e: KeyboardEvent) => {
                if (chosenColor === undefined || !chosenToken) {
                    return Promise.resolve();
                }

                if (!session.list[chosenColor].tokens[chosenToken-1].hp) {
                    setChosenOperator(undefined);
                    return Promise.resolve(addHandler(e.getModifierState("NumLock") ? NORMAL : ELITE, 1))
                }

                return Promise.resolve(setChosenOperator(1));
            }
        },
        {
            matcher: (e: KeyboardEvent) => `end` === e.key.toLowerCase() && e.code.toLowerCase() === 'numpad1',
            action: (e: KeyboardEvent) => Promise.resolve(session.setElement({earth: session.elements.earth ? 0 : 2})).catch()
        },
        {
            matcher: (e: KeyboardEvent) => `arrowdown` === e.key.toLowerCase() && e.code.toLowerCase() === 'numpad2',
            action: (e: KeyboardEvent) => Promise.resolve(session.setElement({wind: session.elements.wind ? 0 : 2}))
        },
        {
            matcher: (e: KeyboardEvent) => `arrowleft` === e.key.toLowerCase() && e.code.toLowerCase() === 'numpad4',
            action: (e: KeyboardEvent) => Promise.resolve(session.setElement({fire: session.elements.fire ? 0 : 2}))
        },
        {
            matcher: (e: KeyboardEvent) => `arrowdown` === e.key.toLowerCase() && e.code.toLowerCase() !== 'numpad2',
            action: (e: KeyboardEvent) => Promise.resolve(setChosenColor(prev => {
                if (!prev) {
                    return session.list.length-1;
                }
                return prev - 1;

            }))
        },
        {
            matcher: (e: KeyboardEvent) => `arrowup` === e.key.toLowerCase() && e.code.toLowerCase() !== 'numpad8',
            action: (e: KeyboardEvent) => Promise.resolve(setChosenColor(prev => {
                if (prev === undefined || prev === session.list.length-1) {
                    return 0;
                }
                return prev + 1

            }))
        },
        {
            matcher: (e: KeyboardEvent) => `clear` === e.key.toLowerCase() && e.code.toLowerCase() === 'numpad5',
            action: (e: KeyboardEvent) => Promise.resolve(session.setElement({ice: session.elements.ice ? 0 : 2}))
        },
        {
            matcher: (e: KeyboardEvent) => `home` === e.key.toLowerCase() && e.code.toLowerCase() === 'numpad7',
            action: (e: KeyboardEvent) => Promise.resolve(session.setElement({light: session.elements.light ? 0 : 2}))
        },
        {
            matcher: (e: KeyboardEvent) => `arrowup` === e.key.toLowerCase() && e.code.toLowerCase() === 'numpad8',
            action: (e: KeyboardEvent) => Promise.resolve(session.setElement({dark: session.elements.dark ? 0 : 2}))
        },
        {
            matcher: (e: KeyboardEvent) => `1234567890`.includes(e.key),
            action: (e: KeyboardEvent) => {
                const key = parseInt(e.key, 10)
                if (chosenOperator !== undefined) {
                    setChosenOperator(undefined)
                    return Promise.resolve(addHandler(e.getModifierState("NumLock") ? NORMAL : ELITE, key * chosenOperator))
                }
                return Promise.resolve(setChosenToken(key > 0 ? key : 10))
            }
        },
        {
            matcher: (e: KeyboardEvent) => `home` === e.key.toLowerCase(),
            action: (e: KeyboardEvent) => new Promise(() => {

                setChosenColor(0)
                setChosenOperator(undefined)
                setChosenToken(undefined)
            })

        },
        {
            matcher: (e: KeyboardEvent) => `pageup` === e.key.toLowerCase(),
            action: (e: KeyboardEvent) => new Promise(() => {
                setChosenColor(1 )
                setChosenOperator(undefined)
                setChosenToken(undefined)

            })

        },
        {
            matcher: (e: KeyboardEvent) => `delete` === e.key.toLowerCase(),
            action: (e: KeyboardEvent) => new Promise(() => {
                setChosenColor(2)
                setChosenOperator(undefined)
                setChosenToken(undefined)

            })

        },
        {
            matcher: (e: KeyboardEvent) => `end` === e.key.toLowerCase(),
            action: (e: KeyboardEvent) => new Promise(() => {
                setChosenColor(3 )
                setChosenOperator(undefined)
                setChosenToken(undefined)

            })

        },
        {
            matcher: (e: KeyboardEvent) => `pagedown` === e.key.toLowerCase(),
            action: (e: KeyboardEvent) => new Promise(() => {
                setChosenColor(4 )
                setChosenOperator(undefined)
                setChosenToken(undefined)

            })
        },
        {
            matcher: (e: KeyboardEvent) => `arrowleft` === e.key.toLowerCase() && e.code.toLowerCase() !== 'numpad4',
            action: (e: KeyboardEvent) => Promise.resolve(session.back())
        },
        {
            matcher: (e: KeyboardEvent) => `arrowright` === e.key.toLowerCase() && e.code.toLowerCase() !== 'numpad6',
            action: (e: KeyboardEvent) => Promise.resolve(session.advanceRound())
        },
        {
            matcher: (e: KeyboardEvent) => `backspace` === e.key.toLowerCase() && e.code.toLowerCase() !== 'numpad6',
            action: (e: KeyboardEvent) => Promise.resolve(session.resetSession(session.level ?? 0))
        }
    ], [commonKeyBoardControls, session, addHandler, chosenColor, chosenToken, chosenOperator])

    useKeyboard(handlersv2, keyBoardActive)

    return <>
        {session.round === 0 ?
            <Search {...search}
                    onInput={() => setKeyBoardActive(false)}
                    onBlur={() => setKeyBoardActive(true)}
                    onResultClick={async (result) => await session.add(result)}/> : null}

        <RoundTracker session={sessionId} round={session.round} back={async () => await session.back()}
                      advanceRound={async () => await session.advanceRound()}/>
        <Elements {...session.elements}
                  setElement={async (partial) => await session.setElement(partial)}/>
        <div id='monsters' className='leading-none flex flex-row'>
            {session.list.map((monster, monsterIndex) =>
                <ol key={monster.id} className='flex flex-col flex-1'>
                    <li className='flex flex-col flex-auto'>
                        <h2 onClick={async () => await session.remove(monster.monster)}
                            className={`${theme.seethrough ? `bg-${colors[monsterIndex%colors.length]}` : 'bg-inherit'} py-2 text-base text-center cursor-pointer hover:line-through`}>{monster.monster.name}</h2>

                        <ol className={`${theme.seethrough ? `border-t-8 border-2 
                        
                         border-solid border-${colors[monsterIndex%colors.length]}` : `bg-${colors[monsterIndex%colors.length]}`}
                         ${chosenColor === monsterIndex && chosenToken === undefined ? 'shadow-glow shadow-highlight z-2' : 'z-1'}`}

                        >
                            <li id={'stats'}
                                className={`bg-transparent px-10 py-2 flex flex-row justify-between`}>


                                <div className={`bg-transparent flex flex-row justify-center`}>
                                    <div className={'relative bg-inherit'}>
                                        <svg
                                            className={`opacity-60 fill-normalstat bg-inherit min-h-6 max-h-6 min-w-6 max-w-6 relative`}
                                            width="128"
                                            height="128"
                                            viewBox="0 0 128 128"
                                            xmlns="http://www.w3.org/2000/svg"
                                        >
                                            <path
                                                d="m 62.554041,95.071521 a 7.0272066,7.0272066 0 1 1 -9.93647,9.936469 L 42.6811,95.071521 22.80816,114.95149 a 7.0286304,7.0286304 0 0 1 -9.943497,9.93647 l -9.9364703,-9.93647 a 7.0286313,7.0286313 0 0 1 9.9364703,-9.9435 L 32.74463,85.135051 22.80816,75.198581 A 7.0272066,7.0272066 0 0 1 32.74463,65.26211 Z M 67.529303,90.103286 37.705838,60.286848 97.338714,0.661 122.18692,5.6292351 127.15515,30.477438 Z"
                                            />
                                        </svg>
                                        <span
                                            className={'absolute top-0 bg-transparent text-text'}>{monster.monster.attack[2 * monster.level]}</span>
                                    </div>


                                    <div className={'relative bg-inherit'}>
                                        <svg
                                            className={`opacity-60 fill-normalstat bg-inherit min-h-6 max-h-6 min-w-6 max-w-6 relative`}
                                            width="128"
                                            height="128"
                                            viewBox="0 0 128 128"
                                            xmlns="http://www.w3.org/2000/svg"
                                        >

                                            <g transform="matrix(0.24828173,0,0,0.24828173,0.54966229,32.824106)">
                                                <path
                                                    d="M 511.529,337.45 H 7.928 c 7.129,26.637 16.478,44.576 16.478,44.576 h 147.537 v -24.6 l 50.715,24.6 h 285.854 c 3.276,-17.138 4.149,-31.83 3.017,-44.576 z"/>
                                                <path
                                                    d="m 373.266,245.244 c -21.795,-4.207 -40.727,-13.456 -56.888,-24.976 -1.406,1.403 -3.138,2.505 -5.192,3.081 l -64.48,17.956 c -6.336,1.769 -12.905,-1.937 -14.675,-8.273 -1.762,-6.344 1.949,-12.913 8.28,-14.683 l 55.31,-15.392 c -8.076,-7.756 -15.184,-15.844 -21.328,-23.716 l -58.737,15.084 c -6.369,1.636 -12.859,-2.204 -14.495,-8.565 -1.636,-6.378 2.204,-12.872 8.577,-14.508 l 49.988,-12.847 C 249.267,142.036 244.175,129.974 244.175,129.974 L 258.38224,-127.84912 11.073335,-128.57277 18.262,129.974 c 0,0 3.072,43.03 -13.832,112.198 -6.194,25.31 -5.158,50.82 -1.377,72.99 H 506.838 C 490.503,269.16 437.237,257.582 373.266,245.244 Z"/>
                                            </g>
                                        </svg>
                                        <span
                                            className={'absolute top-0 bg-transparent text-text'}>{monster.monster.speed[2 * monster.level]}</span>
                                    </div>
                                </div>


                                <div className={`bg-transparent flex flex-row justify-center`}>
                                    <div className={'relative bg-inherit'}>
                                        <svg
                                            className={`opacity-60 fill-elitestat bg-inherit min-h-6 max-h-6 min-w-6 max-w-6 relative`}
                                            width="128"
                                            height="128"
                                            viewBox="0 0 128 128"
                                            xmlns="http://www.w3.org/2000/svg"
                                        >
                                            <path
                                                d="m 62.554041,95.071521 a 7.0272066,7.0272066 0 1 1 -9.93647,9.936469 L 42.6811,95.071521 22.80816,114.95149 a 7.0286304,7.0286304 0 0 1 -9.943497,9.93647 l -9.9364703,-9.93647 a 7.0286313,7.0286313 0 0 1 9.9364703,-9.9435 L 32.74463,85.135051 22.80816,75.198581 A 7.0272066,7.0272066 0 0 1 32.74463,65.26211 Z M 67.529303,90.103286 37.705838,60.286848 97.338714,0.661 122.18692,5.6292351 127.15515,30.477438 Z"
                                            />
                                        </svg>
                                        <span
                                            className={'absolute top-0 bg-transparent text-text'}>{monster.monster.attack[2 * monster.level + 1]}</span>
                                    </div>
                                    <div className={'relative bg-inherit'}>
                                        <svg
                                            className={`opacity-60 fill-elitestat bg-inherit min-h-6 max-h-6 min-w-6 max-w-6 relative`}
                                            width="128"
                                            height="128"
                                            viewBox="0 0 128 128"
                                            xmlns="http://www.w3.org/2000/svg"
                                        >
                                            <g transform="matrix(0.24828173,0,0,0.24828173,0.54966229,32.824106)">
                                                <path
                                                    d="M 511.529,337.45 H 7.928 c 7.129,26.637 16.478,44.576 16.478,44.576 h 147.537 v -24.6 l 50.715,24.6 h 285.854 c 3.276,-17.138 4.149,-31.83 3.017,-44.576 z"/>
                                                <path
                                                    d="m 373.266,245.244 c -21.795,-4.207 -40.727,-13.456 -56.888,-24.976 -1.406,1.403 -3.138,2.505 -5.192,3.081 l -64.48,17.956 c -6.336,1.769 -12.905,-1.937 -14.675,-8.273 -1.762,-6.344 1.949,-12.913 8.28,-14.683 l 55.31,-15.392 c -8.076,-7.756 -15.184,-15.844 -21.328,-23.716 l -58.737,15.084 c -6.369,1.636 -12.859,-2.204 -14.495,-8.565 -1.636,-6.378 2.204,-12.872 8.577,-14.508 l 49.988,-12.847 C 249.267,142.036 244.175,129.974 244.175,129.974 L 258.38224,-127.84912 11.073335,-128.57277 18.262,129.974 c 0,0 3.072,43.03 -13.832,112.198 -6.194,25.31 -5.158,50.82 -1.377,72.99 H 506.838 C 490.503,269.16 437.237,257.582 373.266,245.244 Z"/>
                                            </g>
                                        </svg>
                                        <span
                                            className={'absolute top-0 bg-transparent text-text'}>{monster.monster.speed[2 * monster.level + 1]}</span>
                                    </div>
                                </div>
                            </li>

                            {monster.tokens.map((token, tokenIndex) =>
                                <li key={`${monster.id}-${tokenIndex}`} className={` 
                                        ${chosenToken === tokenIndex + 1 && (chosenColor === monsterIndex || chosenToken === undefined) ? 'shadow-glow shadow-highlight z-20' : 'z-1'} 

                                        ${token.rank === ELITE && !(chosenToken === tokenIndex + 1 && (chosenColor === monsterIndex || chosenToken === undefined)) ? `${theme.seethrough ? 'shadow-glow shadow-elite' : 'bg-elite'}` : 'bg-transparent'}
                                         
                                         
                                         flex ${token.hp ? 'flex-row' : 'flex-col'} 
                                pt-2 pr-2`}>
                                    <div
                                        onClick={async () => await session.removeToken(monster, tokenIndex + 1)}
                                        className={`flex text-center bg-transparent ${token.hp ? 'hover:line-through cursor-pointer w-8' : ''}`}>
                                        <span
                                            className=' text-center align-center flex-1 bg-inherit flex justify-center p-1'>{tokenIndex + 1}</span>
                                    </div>
                                    <div
                                        className={`basis-4/6 flex-auto w1 bg-transparent flex flex-col ${token.rank === ELITE ? 'bg-elite' : 'bg-transparent'} justify-center content-center`}>
                                        {token.hp ?
                                            <div
                                                className='flex bg-inherit flex-row relative w-full gap-2'>

                                                <div
                                                    className='basis-full flex-row flex justify-center bg-inherit gap-2 relative pt-0.5'>

                                                    <div className={`transition-[width] z-10 
                                                    ${token.hp / token.maxHp > 0.75 ? 'bg-goodhealth' : (token.hp / token.maxHp > 0.25 && token.hp > 1 ? 'bg-medhealth' : 'bg-badhealth')} left-0 absolute h-full bottom-1`}
                                                         style={{width: `${token.hp / token.maxHp * 100}%`}}
                                                    />

                                                    <span
                                                        className='z-30 basis-1/2 bg-inherit text-right'>{token.hp}</span>
                                                    <span
                                                        className='z-30 w-2 bg-inherit text-center'>/</span>
                                                    <span
                                                        className='z-30 basis-1/2 bg-inherit text-left'>{token.maxHp}</span>

                                                </div>

                                                <div
                                                    className={`${token.armor === 0 ? 'opacity-30' : ''}
                                                              relative top-0 w-8 bg-inherit text-center justify-center content-center p-1`}>
                                                    <svg
                                                        className={`${theme.seethrough ? 'fill-text' : 'fill-main'} bg-inherit min-h-6 max-h-6 min-w-6 max-w-6 relative bottom-1`}
                                                        width="128"
                                                        height="128"
                                                        viewBox="0 0 128 128"
                                                        xmlns="http://www.w3.org/2000/svg">
                                                        <path
                                                            d="m 63.844509,128.0503 c -8.163556,0 -24.30578,-8.71673 -36.480002,-21.37584 C 10.084507,88.716194 -0.15549304,63.839584 -0.15549304,32.051018 A 7.1111114,6.3999525 0 0 1 4.317396,26.105464 C 27.599174,17.721527 46.130732,9.3823905 59.897843,1.1264504 a 7.1111114,6.3999525 0 0 1 7.893332,0 c 13.76,8.2559401 32.305785,16.6014786 55.580455,24.9790136 a 7.1111114,6.3999525 0 0 1 4.47288,5.945554 c 0,31.794964 -10.24,56.671579 -27.52,74.623442 C 88.1574,119.32718 72.015175,128.0503 63.844509,128.0503 Z"
                                                        />
                                                    </svg>
                                                    <div
                                                        className={`${theme.seethrough ? 'text-main' : ''} bg-inherit min-w-6 max-w-6 absolute bottom-1 left-1`}>{token.armor ? token.armor : ''}</div>
                                                </div>
                                                <div
                                                    className={`${token.retaliate === 0 ? 'opacity-30' : ''} relative top-0 w-8 bg-inherit text-center justify-center content-center p-1`}>
                                                    <svg
                                                        className={`${theme.seethrough ? 'fill-text' : 'fill-main'} bg-inherit min-h-6 max-h-6 min-w-6 max-w-6 relative bottom-1`}
                                                        width="128"
                                                        height="128"
                                                        viewBox="0 0 128 128"
                                                        xmlns="http://www.w3.org/2000/svg">
                                                        <path
                                                            d="M 85.547764,40.461533 V 4.4615335 c 0,-2.21 -2.386668,-4.00000002 -5.333334,-4.00000002 H 69.547762 c -2.946666,0 -5.333332,1.79000002 -5.333332,4.00000002 V 41.194034 c 1.673332,-0.445 3.446666,-0.732501 5.323332,-0.732501 z m 42.666666,23.997501 c -0.003,-8.835 -9.55333,-15.997501 -21.33,-15.997501 h -37.38 c -2.926668,0 -5.3,1.767501 -5.3,3.962501 v 0.14 c 0,6.567499 7.1,11.897499 15.856666,11.897499 H 91.81443 c 3.226666,0 4.4,0.895 4.4,2 v 4.05 c 0,1.072499 -1.196666,1.945 -2.626666,2 -14.840002,0.57 -21.386668,6.1775 -32.016668,18.1375 l -2.103334,2.3675 a 2.6646666,1.9985 0 0 1 -3.696666,0.555 l -4.436666,-2.22 a 2.6646666,1.9985 0 0 1 -0.74,-2.772499 l 2.103332,-2.367501 c 5.243334,-5.9 10.066668,-10.815 15.77,-14.52 -5.756666,-1.377499 -10.466666,-4.53 -12.956666,-8.612499 -2.196666,0.852499 -4.653334,1.38 -7.29,1.38 H 37.554431 c -4.113334,0 -7.83,-1.202501 -10.666667,-3.12 -2.84,1.92 -6.556667,3.122499 -10.666667,3.122499 H 5.5544301 c -1.88,0 -3.6566676,-0.287499 -5.33333376,-0.737499 v 19.482499 c 0,8.487501 4.49333376,16.625 12.49666666,22.627497 l 8.833334,6.6275 v 16 h 85.326663 v -15.99 l 11.97,-8.98 a 32.011666,24.00875 0 0 0 9.37334,-16.977497 z m -10.67,-22.522501 V 12.461534 c 0,-2.21 -2.38667,-3.9999999 -5.33333,-3.9999999 h -10.66667 c -2.946666,0 -5.333334,1.7899999 -5.333334,3.9999999 v 27.999999 h 10.666664 c 3.76,0 7.31334,0.577501 10.66667,1.475 z M 5.5544301,56.461533 H 16.221097 c 2.946666,0 5.333334,-1.79 5.333334,-4 V 20.461534 c 0,-2.21 -2.386668,-4 -5.333334,-4 H 5.5544301 c -2.9466676,0 -5.33333376,1.79 -5.33333376,4 v 31.999999 c 0,2.21 2.38666616,4 5.33333376,4 z m 31.9966669,0 h 10.666665 c 2.946668,0 5.333334,-1.79 5.333334,-4 V 12.461534 c 0,-2.21 -2.386666,-3.9999999 -5.333334,-3.9999999 H 37.551097 c -2.946666,0 -5.333333,1.7899999 -5.333333,3.9999999 v 39.999999 c 0,2.21 2.386667,4 5.333333,4 z"
                                                        />
                                                    </svg>
                                                    <div
                                                        className={`${theme.seethrough ? 'text-main' : ''} pl-2 pt-1 bg-inherit min-w-6 max-w-6 absolute bottom-1.5 left-0`}>{token.retaliate ? token.retaliate : ''}</div>
                                                </div>

                                            </div>
                                            : null}
                                    </div>
                                </li>)}
                        </ol>
                    </li>
                </ol>
            )}
        </div>
    </>
}