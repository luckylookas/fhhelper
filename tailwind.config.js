/** @type {import('tailwindcss').Config} */
const {createThemes} = require("tw-colors");
module.exports = {
    content: [
        "./src/**/*.{js,jsx,ts,tsx}",
    ],
    theme: {
        extend: {
            fontSize: {
                '2xs': ['0.4rem', '0.5rem']
            },
            boxShadow: {
                'glow': '-5px 5px 5px 0px rgba(0,0,0,0.75) inset, 5px -5px 5px 0px rgba(0,0,0,0.75) inset',
            },
            fontFamily: {
                sans: ['Comfortaa', 'sans-serif'],
            },
        },
    },
    plugins: [
        createThemes({
            light: {
                'dark': '#57523c',
                'main': '#FBF1C7',
                'light': '#fff6e1',
                'highlight': '#FBF1C799',
                'text': '#3C3836',
                'ctext': '#FBF1C7',
                'red': '#9D0006',
                'green': '#427B58',
                'blue': '#076678',
                'purple': '#8F3F71',
                'elite': '#D7992155',
                'elitestat': '#D79921',
                'goodhealth': '#689D6A',
                'medhealth': '#B57614',
                'badhealth': '#CC241D',
                'elementearth': '#98971A',
                'elementwind': '#928374',
                'elementfire': '#CC241D',
                'elementice': '#458588',
                'elementlight': '#D79921',
                'elementdark': '#8F3F71',
            },
            dark: {
                'dark': '#282828',
                'main': '#3c3836',
                'light': '#665c54',
                'highlight': '#fbf1c7',
                'text': '#fbf1c7',
                'ctext': '#fbf1c7',
                'red': '#cc241d',
                'green': '#98971a',
                'blue': '#458588',
                'purple': '#b16286',
                'elite': '#fabd2f55',
                'elitestat': '#fabd2f',
                'goodhealth': '#b8bb26',
                'medhealth': '#fe8019',
                'badhealth': '#fb4934',
                'elementearth': '#b8bb26',
                'elementwind': '#fbf1c7',
                'elementfire': '#fe8019',
                'elementice': '#83a598',
                'elementlight': '#fabd2f',
                'elementdark': '#aa00ff',
            },
        })
    ],
}
