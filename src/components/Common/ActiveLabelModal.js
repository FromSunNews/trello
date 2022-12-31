import { createNewLabelAPI, updateCardAPI } from 'actions/ApiCall'
import { socketIoInstance } from 'index'
import React, { useEffect, useState } from 'react'
import { Button, Form, Popover } from 'react-bootstrap'
import { useDispatch, useSelector } from 'react-redux'
import { selectCurrentFullBoard, updateCardInBoard, createnewLabelInBoard } from 'redux/activeBoard/activeBoardSlice'
import { selectCurrentActiveCard, updateAllInCurrentActiveCard, createNewLabelInCurrentActiveCard } from 'redux/activeCard/activeCardSlice'
import { colorsLabel } from 'utilities/colorsLabel'

export const ActiveLabelModal = ( { closeAllLabelModal, togglePickColorLabelModal}) => {

  const dispatch = useDispatch()
  const board = useSelector(selectCurrentFullBoard)

  const currentActiveCard = useSelector(selectCurrentActiveCard)

  const [searchText, setSearchText] = useState('')
  const [labels, setLabels] = useState(board.labels)
  const [labelIdsInCard, setLabelIdsInCard] = useState(currentActiveCard.labelIds)

  const onChangeSearchText = (e) => {
    setSearchText(e.target.value)
    if (e.target.value === '') 
      setLabels(board.labels)
    else {
     const results = board.labels.filter( label => label.title.toLowerCase().includes(e.target.value.toLowerCase()))
     setLabels(results)
    }
  }
  const handleCheckboxChange = (labelId) => {
    // Ktra xem trong labelIds của currentActiveCard đã có Id được chọn hay chưa
    console.log('Da vao ham checkbox change ',labelId)
    const checked = labelIdsInCard.includes(labelId)

    let results
    if (checked) {
      // Nếu có thì xóa nó ra
      results = labelIdsInCard.filter(id => id !== labelId)
    }
    else {
      // Nếu chưa thì push nó vào
      results = [
        ...labelIdsInCard,
        labelId
      ]
    }
    dispatch(updateAllInCurrentActiveCard({
      ...currentActiveCard,
      labelIds: results
    }))

    dispatch(updateCardInBoard({
      ...currentActiveCard,
      labelIds: results
    })) 

    updateCardAPI(currentActiveCard._id,{ labelIds: results }).then((updatedLabel) => {
      // do sth
      socketIoInstance.emit('c_user_updated_check_box_label', {
        ...currentActiveCard,
        labelIds: results
      })
    })
  }

  useEffect(() => {
    setLabels(board.labels)
    setLabelIdsInCard(currentActiveCard.labelIds)
  }, [currentActiveCard, board, dispatch])

  return (
    <div className='menu__group__label'>
      <div className="container">
        <div className="row menu__group__label__header">
          <div className="col-sm-2"></div>
          <div className="col-sm-8 menu__group__label__heading">
            <div>Labels</div>
          </div>
          <div className="col-sm-2"
          onClick={closeAllLabelModal}
          >
            <div className='menu__group__label__icon'>
              <i className="fa fa-times"/>
            </div>
          </div>
        </div>
        <hr />
        <Form.Group controlId="card-comment-input" >
          <Form.Control 
            size="sm"
            as="input" 
            rows={1}
            value={searchText}
            onChange={onChangeSearchText}
            placeholder="Search label..."
            style={{
              marginBottom: '10px'
            }}
          />
        </Form.Group>
        <div 
          className='menu__group__label__cards'
        >
        {
          labels.map(label => {
            const checked = labelIdsInCard.some(labelId => labelId === label._id)
            if (label._destroy)
              return
            return(
              <div 
                key={label._id}
                className='menu__group__label__card row g-1'
              >
                <div className='col-sm-1 menu__group__label__checkbox'>
                  <input
                    type="checkbox"
                    className='menu__group__label__checkbox_icon'
                    checked= {checked ? 'checked' : ''}
                    onChange={() => handleCheckboxChange(label._id)}
                  />
                </div>
                <div
                  style={{
                    backgroundColor: label.backgroundColor, 
                    margin: '0',
                    cursor: 'pointer'
                  }}
                  className='menu__group__label__preview col-sm-9'
                  onClick={() => handleCheckboxChange(label._id)}
                  >
                    <div 
                      style={{
                        backgroundColor: label.primaryColor
                      }}
                      className='menu__group__label__preview__circle'
                    ></div>
                    <div className='menu__group__label__preview__title'>{label.title}</div>
                </div>
                <div className='menu__group__label__icon__edit col-sm-1'
                  onClick={() => togglePickColorLabelModal(label._id)}
                >
                  <i className='fa fa-pencil'/>
                </div>
              </div>
            )
          })
        }
        </div>

        <div 
        onClick={()=>togglePickColorLabelModal('')}
        className='menu__group__label__btn_label'>
          <div>Create new label</div>
        </div>
        <hr className='mt-2 mb-2'/>
        <div className='menu__group__label__btn_label'>
          <div>Turn on mode color blind friendly</div>
        </div>
        <div className='menu__group__label__btn_label mt-2 mb-2'>
          <i className='fa fa-bullhorn'/>
          <div>Give us feedback</div>
        </div>
      </div>
    </div>
  )
}
