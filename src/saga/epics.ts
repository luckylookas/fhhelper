import {tap, map} from "rxjs";
import {Action, PayloadAction} from "@reduxjs/toolkit";
import {endScenario, RootState, startScenario} from "./store";
import {Epic, ofType} from "redux-observable";

export const scenarioStartEpic: Epic<PayloadAction<string>, any, RootState> = (action$) => action$.pipe(
    ofType(startScenario.type),
    map(action => action.payload as string),
    tap(payload => console.log('EPIC" start ' + payload)),
    map(action => ({type: '', payload: undefined}))
);

export const scenarioEndEpic: Epic<Action, any, RootState> = (action$) => action$.pipe(
    ofType(endScenario.type),
    tap(action => console.log('EPIC end ')),
    map(action => ({type: '', payload: undefined}))
);