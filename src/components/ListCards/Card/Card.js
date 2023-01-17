import React, { useEffect, useState } from 'react'

import './Card.scss'

import { useDispatch, useSelector } from 'react-redux'
import { updateCurrentActiveCard } from 'redux/activeCard/activeCardSlice'
import { isEmpty } from 'lodash'
import UserAvatar from 'components/Common/UserAvatar'
import { selectCurrentFullBoard, updateCardInBoard, updateCurrentFullBoard } from 'redux/activeBoard/activeBoardSlice'
import { updateBoardAPI, updateCardAPI } from 'actions/ApiCall'
import { socketIoInstance } from 'index'
import moment from 'moment'

function Card(props) {
  const { card } = props
  const dispatch = useDispatch()

  const board = useSelector(selectCurrentFullBoard)

  const [labels, setLabels] = useState(board.labels)
  const [labelIdsInCard, setLabelIdsInCard] = useState(card.labelIds ?? [])
  const [expand, setExpand] = useState(board._expandLabels)
  const [startDate, setStartDate] = useState(card.dates.startDate)
  const [endDate, setEndDate] = useState(card.dates.endDate)

  const [timeNow, setTimeNow] = useState(null)
  const reminderTime = `at ${String(Math.floor(card.dates.endTime/3600)).padStart(2,'0')}:${String(Math.floor(((card.dates.endTime/3600) - Math.floor(card.dates.endTime/3600)) * 60)).padStart(2,'0')}`
  
  const [todoUnFinished, setToDoUnFinished] = useState(null)
  const [todoFinished, setToDoFinished] = useState(null)
  useEffect(() => {
    const arrTime = (new moment().format('HH:mm')).split(':')
    setTimeNow(parseInt(arrTime[0]) * 3600 + parseInt(arrTime[1]) * 60)
  }, [])

  useEffect(() => {
    let totalToDo = 0
    let totalToDoFinish = 0
    card.checklistIds.map(id => {
      const checklist = board.checklists.find(cl => cl._id === id)
      if (checklist) {
        totalToDoFinish += checklist.todoIds.length
        checklist.todoIds.map(id => {
          const todo = board.todos.find(td => td._id === id)
          if (todo && todo._finished) {
            totalToDo++
          }
        })
      }
    })
    setToDoUnFinished(totalToDo)
    setToDoFinished(totalToDoFinish)
  }, [board.todos, board.checklists, card.checklistIds])

  useEffect(() => {
    setLabels(board.labels)
    setLabelIdsInCard(card.labelIds)
    setExpand(board._expandLabels)
    setStartDate(card.dates.startDate)
    setEndDate(card.dates.endDate)
  }, [card, board, dispatch])

  const setActiveCard = (e) => {
    e.preventDefault();
    console.log('e.currentTarget : ',e.currentTarget);
    console.log('e.taget ',e.target);
   if(!e.target.classList.contains('card__small__label') && !e.target.classList.contains('card__small__label__title') 
    && !e.target.classList.contains('card__small__label__circle')
    && !e.target.classList.contains('text')
    && !e.target.classList.contains('dates')
    && !e.target.classList.contains('hover-checkbox1')
    && !e.target.classList.contains('hover-checkbox2')
   ) {
      // handle
      dispatch(updateCurrentActiveCard(card))
   }
  }

  const handlExpandLabel = () => {
    // đưa data vào board redux
    const updateData = {
      ...board,
      _expandLabels:!expand
    }
    dispatch(updateCurrentFullBoard(updateData))
    // goi api update
    updateBoardAPI(board._id, {_expandLabels:!expand}).then((updatedBoard) => {
      socketIoInstance.emit('c_user_updated_board', updatedBoard)
    })

  }

  const handleCheckBox = () => {
    updateCardAPI(card._id, {
      dates: {
        ...card.dates,
        _finished: !card.dates._finished
      }
    }).then(card => {
      dispatch(updateCardInBoard(card))
    })
  }

  return (
    <div className="card-item" onClick={setActiveCard}>
      {card.cover &&
        <img
          src={card.cover}
          className="card-cover"
          alt="trungquandev-alt-img"
          onMouseDown={e => e.preventDefault()}
        />
      }
      <div className="card-item__base-content">
      <div className="card__small__label__container">
      {
        labels &&
        labels.map(label => {
          const checked = labelIdsInCard.some(labelId => labelId === label._id)
          if (checked && !label._destroy) {
            return(
              <div
                  key={label._id}
                  style={{
                    backgroundColor: expand ? label.backgroundColor : label.primaryColor, 
                    margin: '0',
                    cursor: 'pointer',
                    maxWidth: expand ? '100%' : '40px',
                    minWidth: expand ? '32px' : '40px',
                    borderRadius: expand ? '3px' : '10px',
                    height: expand ? '16px' : '8px',
                    marginBottom: expand ? '0px' : '4px'
                  }}
                  className='card__small__label'
                  onClick={() => handlExpandLabel()}
                  >
                    {
                      expand &&
                      <>
                        <div 
                          style={{
                            backgroundColor: label.primaryColor
                          }}
                          className='card__small__label__circle'
                        ></div>
                        <div className='card__small__label__title'>{label.title}</div>
                      </>
                    }

                </div>
            )
          }
        })
      }
      </div>
      <div className="title">{card.title}</div>
      <div className="general-info">
          {
            card?._followed &&
            <i className="fa fa-eye"/>
          }
          {
            (startDate && !endDate)
            ?
            <div 
              className='dates'
            >
              <i className="fa fa-clock-o"/>
              <div className='text'>Started: {(moment(startDate * 1000).calendar()).split(' ')[0]}</div>
            </div>
            :
            (
              ((startDate && endDate) || (!startDate && endDate))
              ?
              <div 
                className='dates'
                onClick={handleCheckBox}
                style={{
                  padding: '5px',
                  backgroundColor: card.dates._finished ? '#61BD4F' 
                  : endDate >= Math.floor(new Date().getTime() / 1000) ? '#F2D600' : '#EB5A46',
                  color: 'white',
                  // display: Math.floor(new Date().getTime() / 1000) >= endDate - 86400 ? 'flex' : 'none' 
                }}
              >
                <i 
                style={{
                  fontSize: '16px'
                }}
                className="fa fa-clock-o hide"/>
                {
                  card.dates._finished ?
                  <i className="fa fa-check-square-o hover-checkbox1"/> :
                  <i className="fa fa-square-o hover-checkbox2"/>
                }
                {/* <input
                  type='checkbox'
                  className='hover-checkbox'
                  onChange={handleCheckBox}
                  checked={card.dates._finished ? true : false}
                /> */}
                <div className='text'>
                {(startDate && endDate)
                ? 
                `${(Math.floor(new Date().getTime() / 1000) - 86400 - timeNow) <= startDate + timeNow && startDate + timeNow <= (Math.floor(new Date().getTime() / 1000) - timeNow) ? 'Yesterday ' : ((Math.floor(new Date().getTime() / 1000) + 86400 + (86400 - timeNow)) >= startDate + timeNow && startDate + timeNow >= (Math.floor(new Date().getTime() / 1000) + (86400 - timeNow))  ? 'Tomorow ' : (startDate + timeNow <= (Math.floor(new Date().getTime() / 1000) + (86400 - timeNow)) && startDate + timeNow >= (Math.floor(new Date().getTime() / 1000) - timeNow) ? 'Today ' : (moment(startDate * 1000).format('ll')).split(',')[0] ))} 
                - ${(Math.floor(new Date().getTime() / 1000) - 86400 - timeNow) <= endDate  && endDate  <= (Math.floor(new Date().getTime() / 1000) - timeNow) ? 'Yesterday '+reminderTime : ((Math.floor(new Date().getTime() / 1000) + 86400 + (86400 - timeNow)) >= endDate  && endDate  >= (Math.floor(new Date().getTime() / 1000) + (86400 - timeNow))  ? 'Tomorow '+reminderTime : (endDate  <= (Math.floor(new Date().getTime() / 1000) + (86400 - timeNow)) && endDate  >= (Math.floor(new Date().getTime() / 1000) - timeNow) ? 'Today '+reminderTime : (moment(endDate * 1000).format('lll')).split(',')[0] ))}` 
                :
                ((Math.floor(new Date().getTime() / 1000) - 86400 - timeNow) <= endDate  && endDate  <= (Math.floor(new Date().getTime() / 1000) - timeNow) ? 'Yesterday '+reminderTime : ((Math.floor(new Date().getTime() / 1000) + 86400 + (86400 - timeNow)) >= endDate  && endDate  >= (Math.floor(new Date().getTime() / 1000) + (86400 - timeNow))  ? 'Tomorow '+reminderTime : (endDate  <= (Math.floor(new Date().getTime() / 1000) + (86400 - timeNow)) && endDate  >= (Math.floor(new Date().getTime() / 1000) - timeNow) ? 'Today '+reminderTime : moment(endDate * 1000).format('lll'))))
                }
                </div>
              </div>
              :
              null
            )
          }
          {
            card?.description &&
            <i className="fa fa-bars"/>
          }
          {
            (card?.checklistIds && todoUnFinished >= 0 && todoFinished > 0 ) &&
            <div className='checklists'
              style={{
                backgroundColor: todoUnFinished === todoFinished ? '#61BD4F' : 'transparent',
                color: todoUnFinished === todoFinished ? 'white' : '#748093'
              }}
            >
              <i className="fa fa-check-square-o"/>
              <div className='checklists-content'>
                {todoUnFinished}/{todoFinished}
              </div>
            </div>
          }
         {card?.comments?.length > 0 &&
          <div className="comments-count">
            <i className="fa fa-comments me-2"/>
            <div className='count-number'>{card?.comments?.length}</div>
          </div>
         }
       </div>
       {!isEmpty(card?.c_CardMembers) &&
        <div className="member__avatars">
          {card?.c_CardMembers.map((u, index) => (
            <div className="member__avatars__item" key={index}>
              <UserAvatar
                user={u}
                width="28px"
                height="28px"
              />
            </div>
          ))}
        </div>
       }
     </div>
    </div>
  )
}

export default React.memo(Card)