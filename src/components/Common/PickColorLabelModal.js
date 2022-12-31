import { createNewLabelAPI, updateLabelAPI } from 'actions/ApiCall'
import React, { useState } from 'react'
import { Button, Form, Popover } from 'react-bootstrap'
import { useDispatch, useSelector } from 'react-redux'
import { toast } from 'react-toastify'
import { selectCurrentFullBoard, createnewLabelInBoard, updateLabelInBoard } from 'redux/activeBoard/activeBoardSlice'
import { selectCurrentActiveCard, createNewLabelInCurrentActiveCard } from 'redux/activeCard/activeCardSlice'
import { colorsLabel } from 'utilities/colorsLabel'

export const PickColorLabelModal = ({ closeAllLabelModal, backToLabelModal, labelIdToEdit }) => {
console.log('🚀 ~ file: PickColorLabelModal.js:10 ~ PickColorLabelModal ~ labelIdToEdit', labelIdToEdit)

  const dispatch = useDispatch()
  const board = useSelector(selectCurrentFullBoard)
  const currentActiveCard = useSelector(selectCurrentActiveCard)
  let editLabelId
  let initalTitleLabel
  let initalColorPicked
  let initalHeadingLabel

  if (labelIdToEdit === '')
  {
    initalTitleLabel = ''
    initalColorPicked = colorsLabel[0].id
    initalHeadingLabel = 'Create new label'
  }
  else {
    const labelToEdit = board.labels.find((label) => label._id == labelIdToEdit)
    initalTitleLabel = labelToEdit.title
    console.log('🚀 ~ file: PickColorLabelModal.js:25 ~ PickColorLabelModal ~ initalTitleLabel', initalTitleLabel)
    
    const colorIdToPick = colorsLabel.find((label) => label.primaryColor === labelToEdit.primaryColor)

    initalColorPicked = colorIdToPick.id
    console.log('🚀 ~ file: PickColorLabelModal.js:30 ~ PickColorLabelModal ~ initalColorPicked', initalColorPicked)
    initalHeadingLabel = 'Edit label'
    editLabelId = labelToEdit._id
  }

  const [titleLabel, setTitleLabel] = useState(initalTitleLabel)
  const [colorPicked, setColorPicked] = useState(initalColorPicked) 

  const onChangeTitleLabel = (e) => {
    setTitleLabel(e.target.value)
  }

  const createNewLabel = () => {
    if (titleLabel === '')
      return
    const newLabel = {
      title: titleLabel,
      boardId: currentActiveCard.boardId,
      createAtCard: currentActiveCard._id,
      backgroundColor: colorsLabel[parseInt(colorPicked) - 1].backgroundColor,
      primaryColor: colorsLabel[parseInt(colorPicked) - 1].primaryColor
    }
    createNewLabelAPI(newLabel).then(label => {
      // nạp dữ liệu vào redux board
      dispatch(createnewLabelInBoard(label)) 
      // nạp dữ liệu vào redux card
      dispatch(createNewLabelInCurrentActiveCard(label)) 

      // reset title
      setTitleLabel('')
      backToLabelModal()
    })
  }

  const handleUpdateLabel = (action) => {
    let updateLabel
    if (action === 'update') {
      if ( initalColorPicked === colorPicked && initalTitleLabel === titleLabel) {
        toast.error('Do not anything to updated', { theme: 'colored' })
        return
      }
      // call api
      updateLabel = {
        title: titleLabel,
        backgroundColor: colorsLabel[parseInt(colorPicked) - 1].backgroundColor,
        primaryColor: colorsLabel[parseInt(colorPicked) - 1].primaryColor
      }
    } else if (action === 'delete') {
      updateLabel = {
        _destroy: true
      }
    }
    updateLabelAPI( editLabelId, updateLabel).then( updatedLabel => {
      // nạp dữ liệu vào redux board
      dispatch(updateLabelInBoard(updatedLabel))

      // reset title
      setTitleLabel('')
      backToLabelModal()
    })
    
  }
  return (
    <div className='menu__group__label'>
      <div className="container">
        <div className="row menu__group__label__header">
          <div className="col-sm-2"
             onClick={backToLabelModal}
          >
            <div className='menu__group__label__icon'>
              <i className="fa fa-angle-left"/>
            </div>
          </div>
          <div className="col-sm-8 menu__group__label__heading">
            <div>{initalHeadingLabel}</div>
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
        <div className="card__element__title">Preview label</div>
        <div
          style={{backgroundColor: colorsLabel[parseInt(colorPicked) - 1].backgroundColor }}
          className='menu__group__label__preview'>
            <div 
              style={{backgroundColor: colorsLabel[parseInt(colorPicked) - 1].primaryColor }}
              className='menu__group__label__preview__circle'></div>
            <div className='menu__group__label__preview__title'>{titleLabel}</div>
        </div>
        <div className="card__element__title">Title</div>
        <Form.Group controlId="card-comment-input" >
          <Form.Control 
            size="sm"
            as="input" 
            rows={1}
            value={titleLabel}
            onChange={onChangeTitleLabel}
            placeholder="Write a title..."
          />
        </Form.Group>
        <br />
        <div className="card__element__title">Pick a color</div>
        <div className="row row-cols-5 g-2">
          {
            colorsLabel.map((colorLabel) => (
              <div className="col"
                key={colorLabel.id}
                onClick={() => setColorPicked(colorLabel.id)}
              >
                <div
                  className='menu__group__label__pick__color'
                  style={{
                    backgroundColor: colorLabel.primaryColor,
                    border: `2px ${ colorPicked === colorLabel.id  ? '#0079bf' : 'transparent'} solid`
                  }}
                ></div>
              </div>
            ))
          }
          
        </div>
        <hr />
        {
          labelIdToEdit === '' ? 
          <div className='menu__group__label__footer'>
            <Button 
              size='sm' 
              variant="primary" 
              className='menu__group__label__footer__btn tqd-send'
              onClick={createNewLabel}
            >Tạo mới</Button>
          </div> :
          <div className='menu__group__label__footer'>
            <Button 
              size='sm'  
              variant="primary" 
              className='menu__group__label__footer__btn'
              onClick={() => handleUpdateLabel('update')}
            >Lưu</Button>
            <Button 
              size='sm' 
              variant="danger" 
              className='menu__group__label__footer__btn'
              onClick={() => handleUpdateLabel('delete')}
            >Xóa</Button>
          </div>

        }
      </div>
    </div>
  )
}
