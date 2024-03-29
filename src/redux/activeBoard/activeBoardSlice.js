import { createSlice, createAsyncThunk, current } from '@reduxjs/toolkit'

import authorizedAxiosInstance from 'utilities/customAxios'

import { API_ROOT } from 'utilities/constants'
import { mapOrder } from 'utilities/sorts'
import { cloneDeep } from 'lodash'


// Khởi tạo giá trị một giá trị của Slice trong Redux
const initialState = {
  currentFullBoard: null
}

// Các hành động gọi api (bất đồng bộ) và cập nhật dữ liệu vào Redux, dùng createAsyncThunk đi kèm với extraReducers
// https://redux-toolkit.js.org/api/createAsyncThunk
export const fetchFullBoardDetailsAPI = createAsyncThunk(
  'activeBoard/fetchFullBoardDetailsAPI',
  async (boardId) => {
    const request = await authorizedAxiosInstance.get(`${API_ROOT}/v1/boards/${boardId}`)
    return request.data
  }
)

export const activeBoardSlice = createSlice({
  name: 'activeBoard',
  initialState,
  reducers: {
    // Lưu ý luôn là ở đây cần cặp ngoặc nhọn cho function trong reducer cho dù code bên trong chỉ có 1 dòng, đây là rule của Redux
    // https://redux-toolkit.js.org/usage/immer-reducers#mutating-and-returning-state
    updateCurrentFullBoard: (state, action) => {
      const fullBoard = action.payload
      state.currentFullBoard = fullBoard
    },
    updateCurrentFullBoardSocket: (state, action) => {
      if (state.currentFullBoard._id === action.payload?._id && state.currentFullBoard.users.some(u => u._id === action.payload?.currentUserId)) {
        const fullBoard = action.payload
        if (fullBoard.currentUserId)
          delete fullBoard.currentUserId
        
        state.currentFullBoard = fullBoard
      }
    },
    createCardInBoard: (state, action) => {
      const newCard = action.payload

      const columnToUpdate = state.currentFullBoard.columns.find(c => c._id === newCard.columnId)

      if (columnToUpdate) {
        columnToUpdate.cardOrder.push(newCard._id)

        const c_CardMembers = state.currentFullBoard.users.find(user => user._id === newCard.memberIds[0])
        newCard.c_CardMembers = [c_CardMembers]
        columnToUpdate.cards.push(newCard)
      }
    },
    updateCardInBoard: (state, action) => {
      // Updating Nested Data
      // https://redux-toolkit.js.org/usage/immer-reducers#updating-nested-data
      
      // console.log('current board', current(state.currentFullBoard))
      console.log('card', action.payload)

      const incomingCard = action.payload
      const column = state.currentFullBoard.columns.find(i => i._id === incomingCard.columnId)
      if(column) {
        const card = column.cards.find(i => i._id === incomingCard._id)
        if(card) {
          card.title = incomingCard.title
          const updateKeys = ['title', 'cover', 'description', 'memberIds', 'comments', 'c_CardMembers', 'columnId', 'labelIds', 'dates', '_followed']
          updateKeys.forEach(key => {
            if (incomingCard[key] != null)
              card[key] = incomingCard[key]
          })
        }
      }
    },
    updateCardInBoardSocket: (state, action) => {
      console.log('updateCardInBoardSocket 1')
      console.log('card: ', action.payload)
      if (state.currentFullBoard._id === action.payload?.boardId && state.currentFullBoard.users.some(u => u._id === action.payload?.currentUserId)) {
      console.log('updateCardInBoardSocket 2')
        // Updating Nested Data
        // https://redux-toolkit.js.org/usage/immer-reducers#updating-nested-data
        
        // console.log('current board', current(state.currentFullBoard))
        // console.log('card', action.payload)
        const incomingCard = action.payload

        const column = state.currentFullBoard.columns.find(i => i._id === incomingCard.columnId)
        if(column) {
          const card = column.cards.find(i => i._id === incomingCard._id)
          if(card) {
            card.title = incomingCard.title
            const updateKeys = ['title', 'cover', 'description', 'memberIds', 'comments', 'c_CardMembers', 'labelIds']
            updateKeys.forEach(key => {
              if (incomingCard[key] != null)
                card[key] = incomingCard[key]
            })
          }
        }
      }
    },
    createnewLabelInBoardSocket: (state, action) => {
      if (state.currentFullBoard._id === action.payload?.boardId && state.currentFullBoard.users.some(u => u._id === action.payload?.currentUserId)) {
        const newLabel = action.payload

        if (newLabel.currentUserId)
          delete newLabel.currentUserId
        
        if (newLabel.currentCardId)
          delete newLabel.currentCardId
        
        console.log('createnewLabelInBoard 1')
        state.currentFullBoard.columns.forEach(col => {
          const card = col.cards.find(i => i._id === newLabel.createAtCard)
          if (card) {
            card.labelIds.push(newLabel._id)
          }
        })
        

        state.currentFullBoard = {
          ...state.currentFullBoard,
          labels: [...state.currentFullBoard.labels, newLabel],
          labelIds: [...state.currentFullBoard.labelIds, newLabel._id]
        }
      }
    },
    createnewLabelInBoard: (state, action) => {

      const newLabel = action.payload
      console.log('createnewLabelInBoard 1')
      state.currentFullBoard.columns.forEach(col => {
        const card = col.cards.find(i => i._id === newLabel.createAtCard)
        if (card) {
          card.labelIds.push(newLabel._id)
        }
      })
      

      state.currentFullBoard = {
        ...state.currentFullBoard,
        labels: [...state.currentFullBoard.labels, newLabel],
        labelIds: [...state.currentFullBoard.labelIds, newLabel._id]
      }

    },
    createnewCheckListInBoard: (state, action) => {

      const newCheckList = action.payload
      state.currentFullBoard.columns.forEach(col => {
        const card = col.cards.find(i => i._id === newCheckList.cardId)
        if (card) {
          card.checklistIds.push(newCheckList._id)
        }
      })
      

      state.currentFullBoard = {
        ...state.currentFullBoard,
        checklists: [...state.currentFullBoard.checklists, newCheckList],
        checklistIds: [...state.currentFullBoard.checklistIds, newCheckList._id]
      }
    },
    updateLabelInBoard: (state, action) => {
      const updatedLabel = action.payload
      console.log('🚀 ~ file: activeBoardSlice.js:105 ~ updatedLabel', updatedLabel)
      
      let labelToUpdate = state.currentFullBoard.labels.find(l => l._id === updatedLabel._id)
      const updateKeys = ['title', 'boardId', 'createAtCard', 'backgroundColor', 'primaryColor', '_destroy']
      updateKeys.forEach(key => {
        if (updatedLabel[key] != null)
        labelToUpdate[key] = updatedLabel[key]
      })
    },
    updateLabelSocket: (state, action) => {
      if (state.currentFullBoard._id === action.payload?.boardId && state.currentFullBoard.users.some(u => u._id === action.payload?.currentUserId)) {

      const updatedLabel = action.payload

      let labelToUpdate = state.currentFullBoard.labels.find(l => l._id === updatedLabel._id)
      const updateKeys = ['title', 'boardId', 'createAtCard', 'backgroundColor', 'primaryColor', '_destroy']
      updateKeys.forEach(key => {
        if (updatedLabel[key] != null)
          labelToUpdate[key] = updatedLabel[key]
      })
    }
    },
    updateCheckListInBoard: (state, action) => {
      const updatedCheckList = action.payload
      console.log('🚀 ~ file: activeBoardSlice.js:105 ~ updatedCheckList', updatedCheckList)
      
      let checklistToUpdate = state.currentFullBoard.checklists.find(checklist => checklist._id === updatedCheckList._id)
      const updateKeys = ['title', 'boardId', 'cardId', 'todoIds', '_destroy']
      updateKeys.forEach(key => {
        if (updatedCheckList[key] != null)
        checklistToUpdate[key] = updatedCheckList[key]
      })
    },
    createnewToDoInBoard: (state, action) => {

      const newToDo = action.payload
      const checklist = state.currentFullBoard.checklists.find(checklist => checklist._id === newToDo.checklistId)
      if (checklist) {
        checklist.todoIds.unshift(newToDo._id)
      }
      state.currentFullBoard = {
        ...state.currentFullBoard,
        todos: [...state.currentFullBoard.todos, newToDo],
        todoIds: [...state.currentFullBoard.todoIds, newToDo._id]
      }
    },
    updateToDoInBoard: (state, action) => {
      const updatedToDo = action.payload
      console.log('🚀 ~ file: activeBoardSlice.js:105 ~ updatedToDo', updatedToDo)
      
      let todoToUpdate = state.currentFullBoard.todos.find(todo => todo._id === updatedToDo._id)
      const updateKeys = ['title', 'boardId', 'checklistId', 'convertCardId', 'expirationDate', 'reminderTime', 'memberIds', '_finished', '_destroy']
      
      updateKeys.forEach(key => {
        if (updatedToDo[key] != null)
          todoToUpdate[key] = updatedToDo[key]
      })
    },
    addUserToBoard: (state, action) => {
      // Kiểm tra nếu board hiện tại là cái board của người đucợ mời chấp nhận 
      // và người dùng hiện tại đang là là một thành viên trong board đó
      if (state.currentFullBoard._id === action.payload?.boardInvitation?.boardId && state.currentFullBoard.users.some(u => u._id === action.payload?.currentUserId)) {
        const invitee = action.payload?.invitee
        console.log('addUserToBoard: ', invitee)
        // Kiểm tra nếu currentFullBoard.users là mảng 
        // và kiểm người được mời không là thành viên trong board đó thì mới đẩy vào (tránh trùng lặp data)
        if (Array.isArray(state.currentFullBoard.users) && invitee && !state.currentFullBoard.users.some(u => u._id === invitee._id)) {
          state.currentFullBoard.users.push(invitee)
          state.currentFullBoard.totalUsers = state.currentFullBoard.users.length
        }
      }
    }
  },
  extraReducers: (builder) => {
    builder.addCase(fetchFullBoardDetailsAPI.fulfilled, (state, action) => {
      let fullBoard = action.payload //chính là cái request data của Api trả về 

      fullBoard.users = fullBoard.owners.concat(fullBoard.members)
      fullBoard.totalUsers = fullBoard.users?.length

      fullBoard.columns = mapOrder(fullBoard.columns, fullBoard.columnOrder, '_id')
      fullBoard.columns.forEach(column => {
        column.cards = mapOrder(column.cards, column.cardOrder, '_id')
        // thêm thành viên vào mỗi card 
        column.cards.forEach(card => {
          let c_CardMembers = []
          if (Array.isArray(card.memberIds)) {
            card.memberIds.forEach(memberId => {
              const fullMemberInfo = fullBoard.users.find(u => u._id === memberId)
              if (fullMemberInfo) {
                c_CardMembers.push(fullMemberInfo)
              }
            })
          }
          card['c_CardMembers'] = c_CardMembers
        })
      })

      state.currentFullBoard = fullBoard
    })
  }
})

// Action creators are generated for each case reducer function
// Actions: dành cho các components bên dưới gọi bằng dispatch() tới nó để cập nhật lại dữ liệu thông qua reducer (chạy đồng bộ)
// Để ý ở trên thì không thấy properties actions đâu cả, bởi vì những cái actions này đơn giản là được thằng redux tạo tự động theo tên của reducer nhé.
export const { 
  updateCurrentFullBoard, 
  updateCurrentFullBoardSocket,
  createCardInBoard,
  updateCardInBoard,
  updateCardInBoardSocket,
  createnewLabelInBoard,
  createnewLabelInBoardSocket,
  createnewCheckListInBoard,
  updateLabelInBoard,
  updateLabelSocket,
  updateCheckListInBoard,
  createnewToDoInBoard,
  updateToDoInBoard,
  addUserToBoard
 } = activeBoardSlice.actions

// Selectors: mục đích là dành cho các components bên dưới gọi bằng useSelector() tới nó
// để lấy dữ liệu từ trong redux store ra sử dụng

export const selectCurrentFullBoard = (state) => {
  return state.activeBoard.currentFullBoard
}
//Export default
export default activeBoardSlice.reducer