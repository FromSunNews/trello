import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import React, { useEffect, useRef, useState } from 'react'
import { Button, Form, ProgressBar } from 'react-bootstrap'
import { faPlusSquare } from '@fortawesome/free-regular-svg-icons'
import { createNewToDoAPI, updateCheckListAPI } from 'actions/ApiCall'
import { useDispatch, useSelector } from 'react-redux'
import { createnewToDoInBoard, selectCurrentFullBoard, updateCheckListInBoard } from 'redux/activeBoard/activeBoardSlice'
import { selectCurrentUser } from 'redux/user/userSlice'
import { selectCurrentActiveCard } from 'redux/activeCard/activeCardSlice'
import { ToDo } from './ToDo'
import { toast } from 'react-toastify'
import { Draggable, Container } from 'react-smooth-dnd'
import UserAvatar from './UserAvatar'
import 'emoji-mart/css/emoji-mart.css'
import { Picker } from 'emoji-mart'
import { MentionsInput, Mention } from 'react-mentions'
import defaultStyle from './css/defaultStyle'
import defaultMentionStyle from './css/defaultMentionStyle'
import Mentions from 'rc-mentions'

const CheckList = ({ checklist }) => {

  const dispatch = useDispatch()
  const currentUser = useSelector(selectCurrentUser)
  const currentActiveCard = useSelector(selectCurrentActiveCard)
  const board = useSelector(selectCurrentFullBoard)


  const [checklistEditOpen, setCheckListEditOpen] = useState(false)
  const checklistEditTextRef = useRef(null) 
  const [checklistTitle, setCheckListTitle] = useState(checklist.title)

  const [todoTitle, setToDoTitle] = useState('')
  const todoEditTextRef = useRef(null) 
  const [todoEditOpen, setToDoEditOpen] = useState(false)

  const [checklistDeletePopup, setCheckListDeletePopup] = useState(false)
  const [percentProgress, setPercentFinishProgress] = useState(null)

  const [totalProgress, setTotalProgress] = useState(null)
  const [totalFinishProgress, setTotalFinishProgress] = useState(null)


  const [hideCheckedToDo, setHideCheckedToDo] = useState(false)
  const [toDos, setToDos] = useState([])

  const [todoCreatePointOpen, setToDoCreatePointOpen] = useState(false)
  
  const [searchText, setSearchText] = useState('')
  const [users, setUsers] = useState(board.users ?? [])
  const [userPointed, setUserPointed] = useState(null)

  const [emojiOpen, setEmojiOpen] = useState(false)



  useEffect(() => {
    if (checklistEditTextRef && checklistEditTextRef.current && checklistEditOpen) {
      checklistEditTextRef.current.focus()
      checklistEditTextRef.current.select()
    }

    if (todoEditTextRef && todoEditTextRef.current && todoEditOpen) {
      todoEditTextRef.current.focus()
      todoEditTextRef.current.select()
    }
    let todos = []
    checklist.todoIds.map((todoId) => {
      const todo = board.todos.find((todo) => todo._id === todoId && !todo._destroy)
      if (todo) {
        todos.push(todo)
      }
    })
    setToDos(todos)
    setTotalFinishProgress(todos.filter(todo => todo._finished).length)
    console.log('todos', todos)
    if (todos.length > 0) 
      setPercentFinishProgress((parseFloat(todos.filter(todo => todo._finished).length * 100) / parseFloat(todos.length)).toFixed())
    else 
      setPercentFinishProgress(0)
  }, [checklistEditOpen, todoEditOpen, board.todos])

  const onCheckListTitleChange = (e) => setCheckListTitle(e.target.value)

  const updateNewCheckListTitle = () => {
    if (checklistTitle === '') {
      toast.error('You need write checklist title!')
      setCheckListEditOpen(false)
      return
    }
    if (checklistTitle === checklist.title) {
      setCheckListEditOpen(false)
      return
    }
    updateCheckListAPI(checklist._id, {title: checklistTitle}).then((checklist) => {
      dispatch(updateCheckListInBoard(checklist))
      setCheckListEditOpen(false)
    })
  }

  const createNewToDo = (action) => {
    console.log('🚀 ~ file: CheckList.js:53 ~ createNewToDo ~ action', action)

    if (action === 'add') {
      if (todoTitle == '')
      {
        toast.error('You need write title to-do', { theme: 'colored' })
        return
      }
      console.log('🚀 ~ file: CheckList.js:53 ~ createNewToDo ~ action', action)
      
      let todo = {
        title: todoTitle,
        boardId: board._id,
        checklistId: checklist._id,
        memberIds: userPointed ? [userPointed] : []
      }
      createNewToDoAPI(todo).then( todo => {
        dispatch(createnewToDoInBoard(todo))
        setToDoTitle('')
        setToDoEditOpen(false)
        setToDoCreatePointOpen(false)
        setUserPointed(null)
        setEmojiOpen(false)
      })
    }
    else if (action === 'cancel') {
      setToDoTitle('')
      setToDoEditOpen(false)
      setToDoCreatePointOpen(false)
      setUserPointed(null)
      setEmojiOpen(false)

    }

  }

  const handleDeleteCheckList = () => {
    updateCheckListAPI(checklist._id, {_destroy: true} ).then(checklist => {
      dispatch(updateCheckListInBoard(checklist))
    })
    setCheckListDeletePopup(false)
  }

  const handleBlurAddToDo = (e) => {
    console.log('e.currentTarget : ',e.currentTarget);
    console.log('e.taget ',e.target);
    if(e.currentTarget.classList.contains('card__modal__checklist__btn')) {
    console.log('Nhận ');
    //  
      e.preventDefault();
    } else {
      setToDoEditOpen(false)
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

  const handleUserToDo = (userId) => {
    setUserPointed(userId)
    setToDoCreatePointOpen(false)
  }

  const fetchUsers = (query, callback) => {
    if (!query) return
  
    const filteredUsers = board.users.filter((user) =>
      user.display.toLowerCase().includes(query)
    )
    callback(filteredUsers)
  }

  return (
    <div className='card__modal__checklist__container'>
      <div className='card__modal__checklist'>
        <i className="fa fa-check-square-o"/>
        {
          !checklistEditOpen ?
          <div className="card__modal__checklist__heading">
            <div 
            className="card__modal__checklist__heading__title"
              onClick={() =>  setCheckListEditOpen(true)}
            >{checklist.title}</div>
            <div className="card__modal__checklist__heading__btn">
              <div 
                className="card__modal__checklist__heading__btn-item"
                onClick={() => setHideCheckedToDo(!hideCheckedToDo)}
              >
                <div>{!hideCheckedToDo ? 'Hide selected items' : `Show checked to-do (${totalFinishProgress})`}</div>
              </div>
              <div 
                className="card__modal__checklist__heading__btn-item"
                style={{
                  marginLeft:'10px'
                }}
                onClick={() => setCheckListDeletePopup(!checklistDeletePopup)}
              >
                <div>Delete</div>
              </div>
              {
                checklistDeletePopup && 
                <div className='card__modal__checklist__popup__delete'>
                  <div className="container">
                    <div className="card__modal__checklist__popup__delete__header">
                      
                      <div className="card__modal__checklist__popup__delete__heading">
                        <div>You want to delete?</div>
                      </div>
                      <div 
                        className='card__modal__checklist__popup__delete__icon'
                        onClick={() => setCheckListDeletePopup(false)}
                      >
                        <i className="fa fa-times"/>
                      </div>
                    </div>
                    <hr className='mt-2 mb-2' />
                    <div className='card__modal__checklist__popup__delete__desc'>The checklist will be permanently deleted and never recovered.</div>
                    <Button 
                      size='sm' 
                      variant="danger" 
                      className='card__modal__checklist__popup__delete__footer__btn'
                      onClick={() => handleDeleteCheckList()}
                    >Clear this checklist</Button>
                  </div>
                </div>
              }

            </div>
          </div> :
          <div className='card__modal__checklist__edit'>
            <Form.Control
              size="sm"
              as="textarea" 
              rows={2}
              className="card__modal__checklist__edit__content-editable card__modal__checklist__edit__title"
              value={checklistTitle}
              onChange={onCheckListTitleChange}
              ref={checklistEditTextRef}
              onBlur={updateNewCheckListTitle}
              onKeyDown={e => (e.key === 'Enter') && updateNewCheckListTitle()}
              // onClick={selectAllInlineText}
              onMouseDown={e => (e.key === 'Enter') && updateNewCheckListTitle()}
              spellCheck="false"
            />
            <div className="card__modal__checklist__edit__btns">
              <Button
                size='sm' 
                variant="primary" 
                className='card__modal__checklist__edit__btns__btn tqd-send'
                onClick={updateNewCheckListTitle}
              >Save</Button>
              <i className="fa fa-times"/>
            </div>
          </div>
        }
      </div>

      <div className='card__modal__progressbar_container'>
        <div className='card__modal__progressbar__title'>{percentProgress}%</div>
        <ProgressBar now={ percentProgress } variant={percentProgress == 100  ? 'success' : ''}/>
      </div>
      
          <div className='card__modal__todo'>
              <Container
              orientation="vertical" // default
              groupName="todo_cards"
              // onDrop={dropResult => onCardDrop(column._id, dropResult)}
              getChildPayload={index =>  toDos[index]}
              dragClass="card-ghost"
              dropClass="card-ghost-drop"
              dropPlaceholder={{
                animationDuration: 150,
                showOnTop: true,
                className: 'card-drop-preview'
              }}
              dropPlaceholderAnimationDuration={200}
            >
            { 
                checklist.todoIds.map((todoId, index) => {
                  const todo = board.todos.find((todo) => todo._id === todoId)
                  if (todo && !todo._destroy)
                    return(
                      <Draggable key={index}>
                        <ToDo todo={todo} todoIds={checklist.todoIds} hideCheckedToDo={hideCheckedToDo}/>
                      </Draggable>
                    )
                })
            }
            </Container>
          </div>
          
      {
        !todoEditOpen 
        ? 
        <div className='card__modal__checklist__btn'
          onClick={() => setToDoEditOpen(true)}
        >
          <div>Add to-do</div>
        </div>
        :
        <div className='card__modal__checklist__create__todo'
          // onBlur={(e) => handleBlurAddToDo(e)}
        >
            <Form.Control
              size="sm"
              as="textarea" 
              rows={3}
              className="card__modal__checklist__create__todo__content-editable card__modal__checklist__create__todo__title"
              value={todoTitle}
              onChange={(e) => setToDoTitle(e.target.value)}
              ref={todoEditTextRef}
              
              onKeyDown={e => (e.key === 'Enter') && setToDoEditOpen(false)}
              // onClick={selectAllInlineText}
              onMouseDown={e => (e.key === 'Enter') && setToDoEditOpen(false)}
              spellCheck="false"
            />
            
            <div className="card__modal__checklist__create__todo__btns">
              <div className='card__modal__checklist__create__todo__btns-container1'>
                <Button
                  size='sm' 
                  variant="primary" 
                  className='card__modal__checklist__create__todo__btn tqd-send'
                  onClick={() => createNewToDo('add')}
                >Add</Button>

                <Button
                  size='sm'   
                  variant="light" 
                  className='card__modal__checklist__create__todo__btn'
                  onClick={() => createNewToDo('cancel')}
                >
                  <span>Cancel</span>
                </Button>
              </div>
              <div className='card__modal__checklist__create__todo__btns-container2'>
                <Button
                  size='sm' 
                  variant="light" 
                  className='card__modal__checklist__create__todo__btn'
                  onClick={() => setToDoCreatePointOpen(!todoCreatePointOpen)}
                >
                  <i className="fa fa-user-plus"></i>
                  <span className='card__modal__checklist__create__todo__btn-text'>{userPointed ? board.users.find(user => user._id === userPointed).displayName : 'Point'}</span>
                  
                </Button>

                {
                  todoCreatePointOpen && 
                    <div className='todo__popup__create__point-container'>
                      <div className="container">
                        <div className="todo__popup__create__point-header">
                          <div className=" todo__popup__create__point-heading">
                            <div>Point</div>
                          </div>
                          <div 
                            className='todo__popup__create__point-icon'
                            onClick={() => setToDoCreatePointOpen(false)}
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
                              className="todo__popup__create__point__members__container"
                              onClick={() => handleUserToDo(user._id)}
                            >
                              <UserAvatar user={user} tooltip={user.displayName}/>
                              <div className="todo__popup__create__point__members__space">
                                <div className="todo__popup__create__point__members__name">{user.displayName}</div>
                                <div className='todo__popup__create__point-icon'
                                  style={{
                                    display: userPointed === user._id ? 'flex' : 'none'
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
                        <div className='todo__popup__create__point__members__btn'
                          style={{
                            opacity: userPointed ? '1' : '0.4',
                            pointerEvents: userPointed ? 'auto' : 'none',
                            cursor: userPointed ? 'pointer' : 'not-allowed'
                          }}
                        >
                          <div 
                            className='todo__popup__create__point__members__btn-title'
                            onClick={() => setUserPointed(null)}
                          >Remove member</div>
                        </div>
                      </div>

                    </div>
                  }

                <Button
                  size='sm' 
                  variant="light" 
                  className='card__modal__checklist__create__todo__btn'
                >
                  <i className="fa fa-clock-o"></i>
                  <span className='card__modal__checklist__create__todo__btn-text'>Expiration date</span>
                </Button>

                <Button
                  size='sm' 
                  variant="light" 
                  className='card__modal__checklist__create__todo__btn'
                >
                  <i className="fa fa-at"></i>
                </Button>

                <Button
                  size='sm' 
                  variant="light" 
                  className='card__modal__checklist__create__todo__btn'
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

export default CheckList