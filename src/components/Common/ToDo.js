import { createNewCardAPI, updateToDoAPI } from 'actions/ApiCall'
import { Picker } from 'emoji-mart'
import React, { useEffect, useRef, useState } from 'react'
import { Button, Form } from 'react-bootstrap'
import { useDispatch, useSelector } from 'react-redux'
import { toast } from 'react-toastify'
import { createCardInBoard, selectCurrentFullBoard, updateToDoInBoard } from 'redux/activeBoard/activeBoardSlice'
import { selectCurrentActiveCard } from 'redux/activeCard/activeCardSlice'
import UserAvatar from './UserAvatar'

export const ToDo = ({ todo, todoIds, hideCheckedToDo}) => {
  const dispatch = useDispatch()

  const board = useSelector(selectCurrentFullBoard)
  const currentActiveCard = useSelector(selectCurrentActiveCard)

  const [todoIdsInCheckList, setToDoIdsInCheckList] = useState(todoIds)
  const [todoEditOpen, setToDoEditOpen] = useState(false)
  const [todoTitle, setToDoTitle] = useState(todo.title)
  const todoEditTextRef = useRef(null) 
  
  const [todoActionMoreOpen, setToDoActionMoreOpen] = useState(false)
  const [todoActionPointOpen, setToDoActionPointOpen] = useState(false)

  const [todoEditPointOpen, setToDoEditPointOpen] = useState(false)

  const [emojiOpen, setEmojiOpen] = useState(false)  

  const [searchText, setSearchText] = useState('')
  const [users, setUsers] = useState(board.users ?? [])
  const [userPointed, setUserPointed] = useState(board.users.find(user => user._id === todo.memberIds[0]))

  useEffect(() => {
  
    if (todoEditTextRef && todoEditTextRef.current && todoEditOpen) {
      todoEditTextRef.current.focus()
      todoEditTextRef.current.select()
    }
    setUserPointed(board.users.find(user => user._id === todo.memberIds[0]))
  }, [todoEditOpen, todo.memberIds])

  const handleCheckboxChange = () => {
    
    dispatch(updateToDoInBoard({
      _id: todo._id,
      _finished: !todo._finished
    }))

    updateToDoAPI(todo._id, { _finished: !todo._finished} ).then((updatedToDo) => {

      // do sth
      // socketIoInstance.emit('c_user_updated_check_box_todo', {
      //   ...currentActiveCheckList,
      //   todoIds: results
      // })
    })
  }

  // const handleBlurUpdateToDo = (e) => {
  //   console.log('e.currentTarget : ',e.currentTarget);
  //   console.log('e.taget ',e.target);
  //   if(e.currentTarget.classList.contains('card__modal__checklist__btn')) {
  //   console.log('Nhận ');
  //   //  
  //     e.preventDefault();
  //   } else {
  //     setToDoEditOpen(false)
  //   }
  // }

  const updateToDo = (action) => {
    // console.log('🚀 ~ file: CheckList.js:53 ~ createNewToDo ~ action', action)

    if (action === 'add') {
      if (todoTitle == '')
      {
        toast.error('You need write title to-do', { theme: 'colored' })
        setToDoEditOpen(false)
        return
      }
      if (todoTitle === todo.title) {
        setToDoEditOpen(false)
        return
      }
      console.log('🚀 ~ file: CheckList.js:53 ~ createNewToDo ~ action', action)
      
      let todoUpdate = {
        title: todoTitle
      }
      updateToDoAPI(todo._id , todoUpdate).then( updatedToDo => {
        dispatch(updateToDoInBoard(updatedToDo))
        setToDoEditOpen(false)
        setEmojiOpen(false)
        setToDoEditPointOpen(false)
      })
    }
    else if (action === 'cancel') {
      setToDoEditOpen(false)
      setEmojiOpen(false)
      setToDoEditPointOpen(false)
      setToDoTitle(todo.title)
    }

  }

  const onChangeSearchText = (e) => {
    setSearchText(e.target.value)
    if (e.target.value === '') 
      setUsers(board.users)
    else {
     const results = board.users.filter( user => user.displayName.toLowerCase().includes(e.target.value.toLowerCase()))
     setUsers(results)
    }
  }

  const handleAddUserToDo = (userId) => {
    if (todo.memberIds.some(id => id === userId)) {
      updateToDoAPI(todo._id ,{memberIds: []}).then(updatedToDo => {
        dispatch(updateToDoInBoard(updatedToDo))
        setSearchText('')
        setToDoActionPointOpen(false)
        setToDoEditPointOpen(false)
      })
    }
    else {
      updateToDoAPI(todo._id ,{memberIds: [userId]}).then(updatedToDo => {
        dispatch(updateToDoInBoard(updatedToDo))
        setSearchText('')
        setToDoActionPointOpen(false)
        setToDoEditPointOpen(false)

      })
    }
  }

  const handleRemoveAllUserToDo = () => {
    updateToDoAPI(todo._id ,{memberIds: []}).then(updatedToDo => {
      dispatch(updateToDoInBoard(updatedToDo))
      setSearchText('')
      setToDoActionPointOpen(false)
      
    })
  }

  const handleDeleteToDo = () => {
    console.log('🚀 ~ file: CheckList.js:53 ~ deleteToDo ~ id', todo._id)
    updateToDoAPI(todo._id, { _destroy: true }).then( updatedToDo => {
      dispatch(updateToDoInBoard(updatedToDo))
      setToDoActionMoreOpen(false)
    })
  }

  const handleConvertToCard = () => {

    const newCardToAdd = {
      boardId: currentActiveCard.boardId,
      columnId: currentActiveCard.columnId,
      title: todo.title,
      memberIds: todo.memberIds,
      dates: {
        _finished: todo._finished
      }
    }
    
    const keyToAdd = ['expirationDate', 'reminderTime', '_finished']
    keyToAdd.map(key => {
      if (todo[key] !== null && todo[key] !== []) {
        newCardToAdd.dates = {
          ...newCardToAdd.dates,
          [key]: todo[key]
        }
      }
    })

    if (!newCardToAdd.dates.expirationDate && !newCardToAdd.dates.reminderTime )
      delete newCardToAdd.dates
    
    updateToDoAPI(todo._id, { _destroy: true }).then( updatedToDo => {
      dispatch(updateToDoInBoard(updatedToDo))
      createNewCardAPI(newCardToAdd).then( newCard => {
        dispatch(createCardInBoard(newCard))
        setToDoActionMoreOpen(false)
      })
    })
  }

  

  if (hideCheckedToDo && todo._finished)
    return
  return (
    <div className='card__modal__todo__item'
      style={{
        alignItems: todoEditOpen ? 'flex-start' : 'center',
        height: todoEditOpen ? 'auto' : '38px'
      }}
    >
      <input
        type="checkbox"
        className='card__modal__todo__item-checkbox'
        checked= {todo._finished ? true : false}
        onChange={() => handleCheckboxChange(todo._id)}
        style={{
          marginTop: todoEditOpen ? '22px' : '0',
          marginRight: todoEditOpen ? '12px' : '0'
        }}
      />
      {
        !todoEditOpen 
        ? 
        <div className='card__modal__todo__item-container'>
          <div 
            className='card__modal__todo__item-container-title'
            style={{
              textDecoration:todo._finished ? 'line-through' : 'none',
              opacity:todo._finished ? '0.6' : '1'
            }}
            onClick={() => setToDoEditOpen(true)}
          >{todo.title}</div>
          <div className='card__modal__todo__item-container-control'>
            <div
              className='card__modal__todo__item-container-control__btn'
              style={
                userPointed ?  {
                display: 'flex'
                }
                :
                undefined
            }
            >
              <i className="fa fa-clock-o"></i>
            </div>

            <div
              className='card__modal__todo__item-container-control__btn'
              onClick={() => setToDoActionPointOpen(!todoActionPointOpen)}
              style={ 
                userPointed ? {
                borderRadius:'50%',
                display:'flex',
                marginRight:'33px'
              } : {
                borderRadius:'50%'
              }
            }
            >
              {
                userPointed 
                ?
                <UserAvatar 
                  user={userPointed} 
                  tooltip={userPointed.displayName}
                  width="25px" 
                  height='25px'
                />
                :
                <i className="fa fa-user-plus"></i>
              }
            </div>

            {
              todoActionPointOpen && 
              <div className='todo__popup__action__point-container'>
                <div className="container">
                  <div className="todo__popup__action__point-header">
                    <div className=" todo__popup__action__point-heading">
                      <div>Point</div>
                    </div>
                    <div 
                      className='todo__popup__action__point-icon'
                      onClick={() => setToDoActionPointOpen(false)}
                    >
                      <i className="fa fa-times"/>
                    </div>
                  </div>
                  <hr className='mt-2 mb-2' />
                  <Form.Control 
                    size="sm"
                    as="input" 
                    rows={1}
                    value={searchText}
                    onChange={onChangeSearchText}
                    placeholder="Search members"
                    style={{
                      marginBottom: '10px',
                      fontSize: '14px'
                    }}
                  />
                  <div className="card__element__title">Card members</div>
                </div>
                {
                  users.map(user => {
                    return(
                      <div 
                        key={user._id}                      
                        className="todo__popup__action__point__members__container"
                        onClick={() => handleAddUserToDo(user._id)}
                      >
                        <UserAvatar user={user} tooltip={user.displayName}/>
                        <div className="todo__popup__action__point__members__space">
                          <div className="todo__popup__action__point__members__name">{user.displayName}</div>
                          <div className='todo__popup__action__point-icon'
                            style={{
                              display: todo.memberIds.some( id => id === user._id) ? 'flex' : 'none'
                            }}
                          >
                            <i className="fa fa-check"/>
                          </div>
                        </div>
                      </div>
                    )
                  })
                }
                
                <div className="container">
                  <div className='todo__popup__action__point__members__btn'
                    style={{
                      opacity: todo.memberIds.length > 0 ? '1' : '0.4',
                      pointerEvents: todo.memberIds.length > 0 ? 'auto' : 'none',
                      cursor: todo.memberIds.length > 0 ? 'pointer' : 'not-allowed'
                    }}
                  >
                    <div 
                      className='todo__popup__action__point__members__btn-title'
                      onClick={handleRemoveAllUserToDo}
                    >Remove member</div>
                  </div>
                </div>

              </div>
            }

            <div
              className='card__modal__todo__item-container-control__btn'
              onClick={() => setToDoActionMoreOpen(!todoActionMoreOpen)}
              // style={{
              //   display: userPointed ? 'flex' : 'none'
              // }}
            >
              <i className="fa fa-ellipsis-h"></i>
            </div>
            {
            todoActionMoreOpen && 
            <div className='todo__popup__action-container'>
              <div className="container">
                <div className="todo__popup__action-header">
                  <div className=" todo__popup__action-heading">
                    <div>To-do actions</div>
                  </div>
                  <div 
                    className='todo__popup__action-icon'
                    onClick={() => setToDoActionMoreOpen(false)}
                  >
                    <i className="fa fa-times"/>
                  </div>
                </div>
                <hr className='mt-2 mb-2' />
              </div>
              <div 
                className='todo__popup__action-btn'
                onClick={handleConvertToCard}
              >Convert to card</div>
              <div 
                className='todo__popup__action-btn'
                onClick={handleDeleteToDo}
              >Delete</div>

            </div>
          }
          </div>
          
        </div>
        :
        <div className='card__modal__todo__item__create__todo'
          >
              <Form.Control
                size="sm"
                as="textarea" 
                rows={2}
                className="card__modal__todo__item__create__todo__content-editable card__modal__todo__item__create__todo__title"
                value={todoTitle}
                onChange={(e) => setToDoTitle(e.target.value)}
                ref={todoEditTextRef}
                
                onKeyDown={e => (e.key === 'Enter') && setToDoEditOpen(false)}
                onMouseDown={e => (e.key === 'Enter') && setToDoEditOpen(false)}
                // onBlur={() => updateToDo('add')}
                // onClick={selectAllInlineText}
                spellCheck="false"
              />
              <div className="card__modal__todo__item__create__todo__btns">
                <div className='card__modal__todo__item__create__todo__btns-container1'>
                  <Button
                    size='sm' 
                    variant="primary" 
                    className='card__modal__todo__item__create__todo__btn tqd-send'
                    onClick={() => updateToDo('add')}
                  >Add</Button>

                  <Button
                    size='sm' 
                    variant="light" 
                    className='card__modal__todo__item__create__todo__btn'
                    onClick={() => updateToDo('cancel')}
                  >
                    <span>Cancel</span>
                  </Button>
                </div>
                <div className='card__modal__todo__item__create__todo__btns-container2'>
                  <Button
                    size='sm' 
                    variant="light" 
                    className='card__modal__todo__item__create__todo__btn'
                    onClick={() => setToDoEditPointOpen(!todoEditPointOpen)}
                  >
                    <i className="fa fa-user-plus"></i>
                    <span className='card__modal__todo__item__create__todo__btn-text'>{userPointed ? userPointed.displayName : 'Point'}</span>
                  </Button>

                  {
                    todoEditPointOpen && 
                    <div className='todo__popup__edit__point-container'>
                      <div className="container">
                        <div className="todo__popup__edit__point-header">
                          <div className=" todo__popup__edit__point-heading">
                            <div>Point</div>
                          </div>
                          <div 
                            className='todo__popup__edit__point-icon'
                            onClick={() => setToDoEditPointOpen(false)}
                          >
                            <i className="fa fa-times"/>
                          </div>
                        </div>
                        <hr className='mt-2 mb-2' />
                        <Form.Control 
                          size="sm"
                          as="input" 
                          rows={1}
                          value={searchText}
                          onChange={onChangeSearchText}
                          placeholder="Search members"
                          style={{
                            marginBottom: '10px',
                            fontSize: '14px'
                          }}
                        />
                        <div className="card__element__title">Card members</div>
                      </div>
                      {
                        users.map(user => {
                          return(
                            <div 
                              key={user._id}                      
                              className="todo__popup__edit__point__members__container"
                              onClick={() => handleAddUserToDo(user._id)}
                            >
                              <UserAvatar user={user} tooltip={user.displayName}/>
                              <div className="todo__popup__edit__point__members__space">
                                <div className="todo__popup__edit__point__members__name">{user.displayName}</div>
                                <div className='todo__popup__edit__point-icon'
                                  style={{
                                    display: todo.memberIds.some( id => id === user._id) ? 'flex' : 'none'
                                  }}
                                >
                                  <i className="fa fa-check"/>
                                </div>
                              </div>
                            </div>
                          )
                        })
                      }
                      
                      <div className="container">
                        <div className='todo__popup__edit__point__members__btn'
                          style={{
                            opacity: todo.memberIds.length > 0 ? '1' : '0.4',
                            pointerEvents: todo.memberIds.length > 0 ? 'auto' : 'none',
                            cursor: todo.memberIds.length > 0 ? 'pointer' : 'not-allowed'
                          }}
                        >
                          <div 
                            className='todo__popup__edit__point__members__btn-title'
                            onClick={handleRemoveAllUserToDo}
                          >Remove member</div>
                        </div>
                      </div>

                    </div>
                  }

                  <Button
                    size='sm' 
                    variant="light" 
                    className='card__modal__todo__item__create__todo__btn'
                  >
                    <i className="fa fa-clock-o"></i>
                    <span className='card__modal__todo__item__create__todo__btn-text'>Expiration date</span>
                  </Button>

                  <Button
                    size='sm' 
                    variant="light" 
                    className='card__modal__todo__item__create__todo__btn'
                  >
                    <i className="fa fa-at"></i>
                  </Button>

                  <Button
                    size='sm' 
                    variant="light" 
                    className='card__modal__todo__item__create__todo__btn'
                    onClick={() => setEmojiOpen(!emojiOpen)}
                  >
                    <i className="fa fa-smile-o"></i>
                  </Button>
                  {
                  emojiOpen &&
                  <Picker
                    emojiSize={20} 
                    sheetSize={20}
                    perLine={8}
                    showPreview={false}
                    style={{
                     position: 'absolute',
                     zIndex: 3,
                     top: '30px',
                     right: '0px'
                    }}
                    onClick={(emoji) => setToDoTitle(todoTitle + emoji.native)}
                  />
                }
                </div>
              </div>
        </div>
      }
      
    </div>
  )
}
