import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import api from '../../utils/api';

export const fetchQuizzes = createAsyncThunk(
  'quiz/fetchQuizzes',
  async () => {
    const response = await api.get('/quizzes');
    return response.data;
  }
);

const quizSlice = createSlice({
  name: 'quiz',
  initialState: {
    list: [],
    loading: false,
    error: null
  },
  extraReducers: builder => {
    builder
      .addCase(fetchQuizzes.pending, state => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchQuizzes.fulfilled, (state, action) => {
        state.loading = false;
        state.list = action.payload;
      })
      .addCase(fetchQuizzes.rejected, (state, action) => {
        state.loading = false;
        state.error = action.error.message;
      });
  }
});

export default quizSlice.reducer;
