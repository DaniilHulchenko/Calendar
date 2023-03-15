import { configureStore } from "@reduxjs/toolkit";
import uiSlice from "./slices/uiSlice";
import { useDispatch, TypedUseSelectorHook, useSelector } from "react-redux";
import cellSlice from "./slices/cellSlice";

/** @todo Get rid of @reduxjs/toolkit - 11.73M size. */
const store = configureStore({
  reducer: {
    ui: uiSlice.reducer,
    cell: cellSlice.reducer,
  },
});

export type RootState = ReturnType<typeof store.getState>;

export const useAppDispatch = () => useDispatch<typeof store.dispatch>();
export const useAppSelector: TypedUseSelectorHook<RootState> = useSelector;

export default store;
