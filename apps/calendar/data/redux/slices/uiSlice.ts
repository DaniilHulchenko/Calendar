import { createSlice, PayloadAction } from "@reduxjs/toolkit";

type UiState = {
  slim: boolean;
  selectedCellId?: number;
};

const initialState: UiState = {
  slim: false,
};

const uiSlice = createSlice({
  name: "ui",
  initialState,
  reducers: {
    setSlim: (state, action: PayloadAction<boolean>) => {
      state.slim = action.payload;
    },
    selectCell: (state, action: PayloadAction<number>) => {
      state.selectedCellId = action.payload;
    },
  },
});

export default uiSlice;
