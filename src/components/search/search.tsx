import React from "react";
import { Monster } from "../../model/model";

interface Props {
    search: (term: string) => void
    results: Monster[];
    onResultClick: (monster: Monster) => void
    onInput: () => void
    onBlur: () => void
}

const SearchItem = ({item, onClick}:{item: Monster, onClick: () => void}) => {
    return <div onClick={onClick} className='text-sm p-2 cursor-pointer bg-main hover:bg-highlight hover:text-main'>{item.name}</div>
}

export const Search = ({search, results, onResultClick, onInput, onBlur}: Props) => {

    return <div className='relative flex flex-col p-2 z-10'>
        <input
            onBlur={onBlur}
            onInput={onInput}
            className='basis-full text-sm border-text border-solid border-b-2 rounded-none' placeholder='search...' onChange={e => search(e.target.value)}/>
        {results.length ?
            <div
                className={'absolute top-7 left-0 right-0 border-text ml-2 mr-2 shadow-md shadow-text'}>
                {
                    results.map(item => <SearchItem item={item} onClick={() => onResultClick(item)} />)
                }
            </div> : null
        }
    </div>

}
