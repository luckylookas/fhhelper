import React, {useState} from "react";
import {useTown} from "../hooks/useTown";
import {FirebaseApp} from "@firebase/app";
import {Building} from "../model/model";
import {Handler, useKeyboard} from "../hooks/useKeyboard";

interface Props {
    firebaseApp: FirebaseApp
    townName: string
    commonKeyBoardControls: Handler[]

}

function mapMoraleToDefense(morale: number): number {
    if (morale < 3) {
        return -10
    }
    if (morale < 5) {
        return -5
    }
    if (morale < 8) {
        return 0
    }
    if (morale < 11) {
        return 5
    }
    if (morale < 14) {
        return 10
    }
    return 15
}

export const TownPage = ({firebaseApp, townName, commonKeyBoardControls}: Props) => {

    const {town, repair, wreck} = useTown(firebaseApp, townName)
    const [hoveringBuilding, setHoveringBuilding] = useState<Building | undefined>(undefined)

    useKeyboard(commonKeyBoardControls, true)

    return   <div className={'flex flex-col justify-center items-center min-w-full px-5'}>
        <div className={'flex flex-col items-center min-w-full'}>
            <div className={'flex flex-auto flex-row text-sm'}>{town.name}</div>
            <div className={'flex flex-auto flex-row text-sm'}>resources as ([propserity]) (wood)
                (ore) (skin)
            </div>
            <div className={'flex flex-row justify-between w-full text-sm'}>
                <div className={'text-sm'}>prosperity:</div>
                <div className={'text-right text-sm'}>{town.prosperity}</div>
            </div>
            <div className={'flex flex-row justify-between w-full text-sm'}>
                <div className={'text-sm'}>morale:</div>
                <div className={'text-right text-sm'}>{town.morale}</div>
            </div>
            <div className={'flex flex-row justify-between w-full text-sm'}>
                <div className={'text-sm'}>defense:</div>
                <div
                    className={'text-right text-sm'}>{mapMoraleToDefense(town.morale) + town.buildings?.filter(it => it.defenseBonus).map(it => it.defenseBonus).reduce((a: number, b: number) => a + b, 0)}</div>
            </div>
            <div className={'flex flex-row justify-between w-full text-sm'}>
                <div className={'text-sm'}>soldiers:</div>
                <div className={'text-right text-sm'}>{town.soldiers}</div>
            </div>
            <div className={`pt-2 min-w-full`}>
                {town.buildings?.map(it => <div
                    key={it.id}
                    onMouseEnter={() => setHoveringBuilding(it)}
                    onMouseLeave={() => setHoveringBuilding(undefined)}
                    onClick={async () => {
                        if (it.wrecked) {
                            await repair(it)
                        } else {
                            await wreck(it)
                        }
                    }}
                    className={`cursor-pointer min-h-6 min-w-full ${it.wrecked ? 'hover:bg-elementearth hover:text-ctext' : 'hover:bg-elementfire hover:text-ctext'} py-1 border-t-2 gap-1 flex flex-row border-highlight border-solid ${it.wrecked ? 'bg-elementfire text-ctext' : ''} justify-between`}>
                    <div
                        className={'text-inherit bg-transparent text-sm flex-auto basis-20 text-nowrap text-left font-bold'}>{it.name} ({it.level})
                    </div>
                    <div
                        className={'text-inherit bg-transparent text-sm flex-auto basis-72 text-pretty text-left'}>{(it.wrecked && hoveringBuilding !== it) || (!it.wrecked && hoveringBuilding === it) ? (it.wreckedEffect ?? 'no effect') : it.effect}</div>
                    <div
                        className={`text-inherit bg-transparent text-sm flex-auto basis-10 text-nowrap text-left`}>
                        {it.wrecked && ['repair for ', ...it.repair].map(n =>
                            <span
                                className={`text-inherit bg-transparent pe-1 text-sm`}>{n}</span>)
                        }
                        {!it.wrecked && it === hoveringBuilding &&
                            <span className={`text-inherit flex bg-transparent text-sm text-left`}>
                                                <span className={`text-inherit bg-transparent pe-1 text-sm text-left`}>save for {it.instantRepairCost}</span>
                                            </span>
                        }
                        {!it.wrecked && it.upgrade && it !== hoveringBuilding &&
                            <span className={`text-inherit flex bg-transparent text-sm text-left`}>
                                                        <span
                                                            className={`${!it.wrecked && it.upgrade && it.upgrade[0] > town.prosperity ? 'text-elementfire' : 'text-inherit'}  bg-transparent pe-1 text-2xs text-left`}>[{it.upgrade[0]}]</span>
                                {it.upgrade.slice(1).map(n => <span
                                    className={`${!it.wrecked && it.upgrade && it.upgrade[0] > town.prosperity ? 'opacity-30' : ''} text-inherit bg-transparent pe-1 text-2xs text-left`}>{n}</span>)}
                                                    </span>
                        }
                        {!it.wrecked && !it.upgrade && it !== hoveringBuilding &&
                            <span className={'text-inherit bg-transparent pe-1 text-sm'}></span>
                        }
                    </div>
                </div>)}
            </div>
        </div>
    </div>
}