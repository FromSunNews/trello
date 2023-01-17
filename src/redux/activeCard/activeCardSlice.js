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
   },
   createNewLabelInCurrentActiveCard: (state, action) => {
    const newLabel = action.payload
    state.currentActiveCard.labelIds.unshift(newLabel._id)
   },
   createNewLabelSocket: (state, action) => {
    if (state.currentActiveCard && state.currentActiveCard._id === action.payload?.currentCardId) {
      const newLabel = action.payload
        
        if (newLabel.currentCardId)
          delete newLabel.currentCardId
      state.currentActiveCard.labelIds.unshift(newLabel._id)
    }
   },
   createNewCheckListInCard: (state, action) => {
    const newCheckList = action.payload
    state.currentActiveCard.checklistIds.unshift(newCheckList._id)
   },
   updateAllInCurrentActiveCard: (state, action) => {
    const currentActiveCard = action.payload
    state.currentActiveCard = currentActiveCard
   },
   updateAllInCardSocKet: (state, action) => {
    if (state.currentActiveCard && state.currentActiveCard._id === action.payload?._id) {

    const currentActiveCard = action.payload
    state.currentActiveCard = currentActiveCard
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
 updateCurrentActiveCardSocket,
 createNewLabelInCurrentActiveCard,
 createNewLabelSocket,
 createNewCheckListInCard,
 updateAllInCurrentActiveCard,
 updateAllInCardSocKet
} = activeCardSlice.actions
 
// Selectors
export const selectCurrentActiveCard = state => {
 return state.activeCard.currentActiveCard
}
 
// Export default reducer
export default activeCardSlice.reducer
 

