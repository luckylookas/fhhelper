import {useEffect, useMemo, useState} from "react";
import {themes} from "../model/contants";

export const useTheme = () => {
    const [theme, setTheme] = useState(0)
    const [seethrough, setseethrough] = useState(false);
    const themeHandler = useMemo(() => {
        return {
            keys: ['m'],
            action: [() => new Promise(() =>
                setTheme(prev => {
                    localStorage.setItem("theme", `${(prev + 1) % themes.length}`)
                    return (prev + 1) % themes.length
                })
            ), () => new Promise(() => setseethrough(prev => {
                localStorage.setItem("seethrough", `${!prev}`)
                return !prev
            }))]
        }
    }, [])


    useEffect(() => {
        if (!localStorage.getItem("theme")) {
            localStorage.setItem("theme", '0')
        }
        if (!localStorage.getItem("seethrough")) {
            localStorage.setItem("seethrough", 'false')
        }

        setTheme(parseInt(localStorage.getItem("theme") ?? '0', 10))
        setseethrough(localStorage.getItem("seethrough") === 'true')
    }, [])

    return {theme: themes[theme], seethrough, themeHandler}
}