import { createSlice } from '@reduxjs/toolkit';

const dashboardSlice = createSlice({
  name: 'dashboard',
  initialState: {
    tabs: []  // you can structure this as needed
  },
  reducers: {
    setTabs: (state, action) => {
      state.tabs = action.payload;
    }
  }
});

export const { setTabs } = dashboardSlice.actions;
export default dashboardSlice.reducer;
