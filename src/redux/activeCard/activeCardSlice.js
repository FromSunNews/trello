import { createSlice } from '@reduxjs/toolkit'
 
const initialState = {
 currentActiveCard: null
}
 
export const activeCardSlice = createSlice({
 name: 'activeCard',
 initialState,
 reducers: {
   clearCurrentActiveCard: (state) => {
     state.currentActiveCard = null
   },
   updateCurrentActiveCard: (state, action) => {
    const incomingCard = action.payload
    // dao nguoc mang
    const reverseCardComments = Array.isArray(incomingCard.comments) ? [...incomingCard.comments].reverse() : []

      state.currentActiveCard = {
        ...incomingCard,
        comments: reverseCardComments
      }
   },
   updateCurrentActiveCardSocket: (state, action) => {
    if (state.currentActiveCard && state.currentActiveCard._id === action.payload?._id) {
      const incomingCard = action.payload

      // dao nguoc mang
      const reverseCardComments = Array.isArray(incomingCard.comments) ? [...incomingCard.comments].reverse() : []

      state.currentActiveCard = {
        ...incomingCard,
        comments: reverseCardComments
      }
    }
   }
 },
 // eslint-disable-next-line no-unused-vars
 extraReducers: (builder) => {
   //
 }
})
// Actions
export const {
 clearCurrentActiveCard,
 updateCurrentActiveCard,
 updateCurrentActiveCardSocket
} = activeCardSlice.actions
 
// Selectors
export const selectCurrentActiveCard = state => {
 return state.activeCard.currentActiveCard
}
 
// Export default reducer
export default activeCardSlice.reducer
 
