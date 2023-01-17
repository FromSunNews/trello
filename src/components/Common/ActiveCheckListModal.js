import { createNewCheckListAPI, updateCardAPI } from 'actions/ApiCall'
import { socketIoInstance } from 'index'
import React, { useEffect, useState } from 'react'
import { Button, Form } from 'react-bootstrap'
import { useDispatch, useSelector } from 'react-redux'
import { toast } from 'react-toastify'
import { createnewCheckListInBoard, selectCurrentFullBoard, updateCardInBoard } from 'redux/activeBoard/activeBoardSlice'
import { createNewCheckListInCard, selectCurrentActiveCard, updateAllInCurrentActiveCard } from 'redux/activeCard/activeCardSlice'

export const ActiveCheckListModal = ( { closeCheckListModal, toggleCheckListModal}) => {

  const dispatch = useDispatch()
  const board = useSelector(selectCurrentFullBoard)

  const currentActiveCard = useSelector(selectCurrentActiveCard)
  const [titleCheckList, setTitleCheckList] = useState('')
  const [valueSelect, setValueSelect] = useState('Do not have!')
  const [idSelect, setIdSelect] = useState(null)
  let listCheckList = board.checklists


  useEffect(() => {
    
  }, [])


  const onChangeTitleCheckList = (e) => {
    setTitleCheckList(e.target.value)
  }

  const createNewCheckList = (title, checklistId) => {
    if (titleCheckList === '' && !title) {
      toast.error('You should enter CheckList title!')
      return
    }
    let newCheckList = {
      title: title ? title : titleCheckList,
      boardId: currentActiveCard.boardId,
      cardId: currentActiveCard._id
    }

    console.log('🚀 ~ file: ActiveCheckListModal.js:43 ~ createNewCheckList ~ idSelect', checklistId)
    if (checklistId) {

      const todos = board.todos.filter(todo => todo.checklistId === checklistId)
      const todoIds = board.checklists.find(checkList => checkList._id === checklistId).todoIds
      let newToDos = []
      todoIds.map(todoId => {
        const todo = todos.find(td => td._id === todoId)
        if (todo) {
          newToDos.push(todo)
        }
      })


      newCheckList = {
        ...newCheckList,
        coppyFrom: checklistId,
        todos: newToDos
      }
    }

    
    createNewCheckListAPI(newCheckList).then((checklist) => {
      dispatch(createnewCheckListInBoard(checklist))
      dispatch(createNewCheckListInCard(checklist))
      closeCheckListModal()
    })
    // createNewLabelAPI(newLabel).then(newLabel => {
    //   socketIoInstance.emit('c_user_created_new_label', {...newLabel, currentCardId: currentActiveCard._id})
    //   // nạp dữ liệu vào redux board
    //   dispatch(createnewLabelInBoard(newLabel)) 
    //   // nạp dữ liệu vào redux card
    //   dispatch(createNewLabelInCurrentActiveCard(newLabel)) 

    //   // reset title
    //   setTitleLabel('')
    //   backToLabelModal()
    // })
  }

  return (
    <div className='menu__group__label'>
      <div className="container">
        <div className="row menu__group__label__header">
          <div className="col-sm-2"></div>
          <div className="col-sm-8 menu__group__label__heading">
            <div>Add a checklist</div>
          </div>
          <div className="col-sm-2"
          onClick={closeCheckListModal}
          >
            <div className='menu__group__label__icon'>
              <i className="fa fa-times"/>
            </div>
          </div>
        </div>
        <hr />
        <div className="card__element__title">
          <i className="fa fa-file-text-o mr-2"></i>
          &nbsp;&nbsp;Suggested
        </div>
        {
          listCheckList &&
          (listCheckList.slice(0).reverse()).map((checklist, index) => {
            if (index < 3 && !checklist._destroy) {
              return (
                <div 
                  className='menu__group__checklist__icon__todo__container' 
                  key={checklist._id}
                  onClick={() => {
                      setIdSelect(checklist._id)
                      createNewCheckList(checklist.title, checklist._id)
                    }}
                >
                  <i 
                    className="fa fa-check-square-o menu__group__checklist__icon__todo"
                  ></i>
                  &nbsp;&nbsp;{checklist.title}
                </div>
              )
            }
          })
        }
        <div className="card__element__title"
          style={{
            marginTop: '5px',
          }}
        >Title</div>
        <Form.Group controlId="card-comment-input" >
          <Form.Control 
            size="sm"
            as="input"
            value={titleCheckList}
            onChange={onChangeTitleCheckList}
            placeholder="Write a title..."
          />
        </Form.Group>
        <div className="card__element__title mt-2">Coppy check list from...</div>
        <select 
          onChange={(e) => {
            setValueSelect(e.target.value)
            setIdSelect(e.target[e.target.selectedIndex].id)
          }} 
          value={valueSelect}
          className='menu__group__checklist__select'
        >
          <option>Do not have!</option>
          {
            board.columns.map((column) => {
              const cards = column.cards.filter(card => card.checklist !== null)
              if (cards) {
                return (
                  cards.map((card) =>
                    <optgroup label={card.title} key={card._id}>
                      {
                        card.checklistIds.map((checklistId) => {
                          const checklists = board.checklists.filter((checklist) => checklist._id === checklistId)
                          if (checklists) {
                            return (
                              checklists.map((checklist)=> 
                                <option 
                                  id={checklist._id} 
                                  value={checklist.title} 
                                  key={checklist._id}
                                >
                                {checklist.title}
                                </option>
                              )
                            )
                          }
                        })
                      }
                    </optgroup>
                    // <option key={card._id}>hahahah</option>
                  )
                )
              }
            })
          }
          
          
        </select>
        <div className='menu__group__label__footer'>
          <Button
            size='sm' 
            variant="primary" 
            className='menu__group__label__footer__btn tqd-send'
            onClick={() => createNewCheckList(null, idSelect)}
          >Add</Button>
        </div>
      </div>
    </div>
  )
}
