import {useDispatch, useSelector, useStore} from "react-redux";
import {AppDispatch, RootState, store} from "./store";

export const useAppDispatch = useDispatch.withTypes<AppDispatch>()
export const useAppSelector = useSelector.withTypes<RootState>()
export const useAppStore = useStore.withTypes<typeof store>()
