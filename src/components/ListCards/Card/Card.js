import React, { useEffect, useState } from 'react'

import './Card.scss'

import { useDispatch, useSelector } from 'react-redux'
import { updateCurrentActiveCard } from 'redux/activeCard/activeCardSlice'
import { isEmpty } from 'lodash'
import UserAvatar from 'components/Common/UserAvatar'
import { selectCurrentFullBoard, updateCurrentFullBoard } from 'redux/activeBoard/activeBoardSlice'
import { updateBoardAPI } from 'actions/ApiCall'

function Card(props) {
  const { card } = props
  const dispatch = useDispatch()

  const board = useSelector(selectCurrentFullBoard)

  const [labels, setLabels] = useState(board.labels)
  const [labelIdsInCard, setLabelIdsInCard] = useState(card.labelIds ?? [])
  const [expand, setExpand] = useState(board._expandLabels)
  useEffect(() => {
    setLabels(board.labels)
    setLabelIdsInCard(card.labelIds)
    setExpand(board._expandLabels)
  }, [card, board, dispatch])

  const setActiveCard = (event) => {
    event.preventDefault();
    console.log('event.currentTarget : ',event.currentTarget);
    console.log('event.taget ',event.target);
   if( !event.target.classList.contains('card__small__label') && !event.target.classList.contains('card__small__label__title') && !event.target.classList.contains('card__small__label__circle')) {
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
    updateBoardAPI(board._id, {_expandLabels:!expand}).then(() => {

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
                    height: expand ? '32px' : '8px',
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
         {card?.comments?.length > 0 &&
          <div className="comments-count">
            <i className="fa fa-comments me-2" />
            {card?.comments?.length}
          </div>
         }
         {!isEmpty(card?.c_CardMembers) &&
          <div className="users-count">
            <i className="fa fa-user me-2" />
            {card?.c_Card?.length}
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