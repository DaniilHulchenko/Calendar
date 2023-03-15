import { createSlice, PayloadAction } from "@reduxjs/toolkit";
// import { Lead } from "supabase/leads.table";

export type CellId = number | "new_cell";

type CellState = {
  id?: CellId;
  draft?: Partial<any>; // Partial<Lead>
};

const initialState: CellState = {};

const cellSlice = createSlice({
  name: "cell",
  initialState,
  reducers: {
    selectLead: (state, action: PayloadAction<CellId>) => {
      state.id = action.payload;

      if (state.id === "new_cell") {
        state.draft = {};
      }
    },
    dismissLead: (state) => {
      state.id = undefined;
    },
    setDraft: (state, action: PayloadAction<Partial<any>>) => {
      // Partial<Lead>
      state.draft = action.payload;
    },
    updateDraft: (state, action: PayloadAction<Partial<any>>) => {
      // Partial<Lead>
      if (!state.draft) {
        throw new Error("The previous draft is undefined to merge with new form values.");
      }

      state.draft = {
        ...state.draft,
        ...action.payload,
      };
    },
    clearDraft: (state) => {
      state.draft = undefined;
    },
  },
});

export default cellSlice;
