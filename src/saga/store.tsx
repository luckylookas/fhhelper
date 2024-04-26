import {
    configureStore,
    createAction,
    createSlice,
    PayloadAction,
} from '@reduxjs/toolkit'
import {combineEpics, createEpicMiddleware} from "redux-observable";
import {scenarioEndEpic, scenarioStartEpic} from "./epics";

export type RootState = ReturnType<typeof store.getState>
export type AppDispatch = typeof store.dispatch

interface ScenarioState {
    id: string
}

export const startScenario = createAction<string>('scenario/start')
export const endScenario = createAction('scenario/end')

export const scenario = createSlice({
    name: 'scenario',
    initialState: {
        id: '',
    } as ScenarioState,
    reducers: {},
    extraReducers: builder => {
        builder
            .addCase(startScenario, (state, action) => ({...state, id: action.payload}))
            .addCase(endScenario, (state) => ({...state, id: ''}))
    },
})

const epicMiddleware = createEpicMiddleware();

export const store = configureStore({
    reducer: {
        scenario: scenario.reducer
    },
    middleware: (getDefaultMiddleware) => getDefaultMiddleware()
        .concat(epicMiddleware),
})


export const rootEpic = combineEpics<PayloadAction<any>, PayloadAction<any>, RootState>(
    scenarioEndEpic ,
    scenarioStartEpic);

// @ts-ignore
// epicMiddleware.run(rootEpic)

export const selectScenarioId = (state: RootState) => state.scenario.id
