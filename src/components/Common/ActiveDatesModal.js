import React, { useEffect, useRef, useState } from 'react'
import { Button, Form } from 'react-bootstrap'
import { DateRange, Calendar } from 'react-date-range';
import format from 'date-fns/format'
import {addDays} from 'date-fns'

import 'react-date-range/dist/styles.css'
import 'react-date-range/dist/theme/default.css'
import { reminders } from 'utilities/reminders';
import moment from 'moment';
import { toast } from 'react-toastify';
import { updateCardAPI } from 'actions/ApiCall';
import { useDispatch, useSelector } from 'react-redux';
import { selectCurrentActiveCard, updateAllInCurrentActiveCard } from 'redux/activeCard/activeCardSlice';
import { updateCardInBoard } from 'redux/activeBoard/activeBoardSlice';

export const ActiveDatesModal = ( {closeDatesModal}) => {

  const currentActiveCard = useSelector(selectCurrentActiveCard)
  const dispatch = useDispatch()
  const [startDateSelected, setStartDateSelected] = useState(currentActiveCard.dates.startDate ? true : false)
  const [endDateSelected, setEndDateSelected] = useState(currentActiveCard.dates.endDate ? true : false)
  const [calendar, setCalendar] = useState(currentActiveCard.dates.startDate ?  new Date(currentActiveCard.dates.startDate * 1000) : (currentActiveCard.dates.endDate ?  new Date(currentActiveCard.dates.endDate * 1000) : new Date()))

  const [startDateText, setStartDateText] = useState(currentActiveCard.dates.startDate ? moment(currentActiveCard.dates.startDate * 1000).format('DD[/]MM[/]YYYY') : format(new Date(), 'dd/MM/yyyy'))
  
  const [endDateText, setEndDateText] = useState(currentActiveCard.dates.endDate ? moment(currentActiveCard.dates.endDate * 1000).format('DD[/]MM[/]YYYY') : format(addDays(new Date(), 2), 'dd/MM/yyyy'))

  const [timeText, setTimeText] = useState(currentActiveCard.dates.endTime ? `${String(Math.floor(currentActiveCard.dates.endTime/3600)).padStart(2,'0')}:${String(Math.floor(((currentActiveCard.dates.endTime/3600) - Math.floor(currentActiveCard.dates.endTime/3600)) * 60)).padStart(2,'0')}` : new moment().format('HH:mm'))

  const secondToRemind = currentActiveCard.dates.endDate - currentActiveCard.dates.reminderTime > 0 ? currentActiveCard.dates.endDate - currentActiveCard.dates.reminderTime : null
  const remind = reminders.find((reminder) => reminder.unixTimeToAdd === secondToRemind)
  const [reminder, setReminder] = useState( remind ? remind.text : 'None')
  const [idSelect, setIdSelect] = useState(remind ? remind.id : null)

  const [range, setRange] = useState([
    {
      startDate:currentActiveCard.dates.startDate ? new Date(currentActiveCard.dates.startDate * 1000) : new Date(),
      endDate: currentActiveCard.dates.endDate ? new Date(currentActiveCard.dates.endDate * 1000) : addDays(new Date(), 2),
      key: 'selection'
    }
  ])

  useEffect(() => {
    if (!currentActiveCard.dates.startDate && !currentActiveCard.dates.endDate) {
      setStartDateSelected(true)
      setEndDateSelected(true)
    }
  }, [])

  const handleSelectDate = (date) => {
    setCalendar(date)
    if (startDateSelected && !endDateSelected) {
      setStartDateText(format(date, 'dd/MM/yyyy'))
      setEndDateText('dd/MM/yyyy')
    } else if (!startDateSelected && endDateSelected) {
      setStartDateText('dd/MM/yyyy')
      setEndDateText(format(date, 'dd/MM/yyyy'))
    }
  }

  const onChangeStartDateText = (e) => {
    setStartDateText(e.target.value)
  }

  const onChangeEndDateText = (e) => {
    setEndDateText(e.target.value)
  }

  const onSelectStartDate = () => {
    const startDate = moment(startDateText, 'DD/MM/YYYY').toDate()
    const endDate = moment(endDateText, 'DD/MM/YYYY').toDate()
    if (startDateSelected && endDateSelected) {
      if (startDate > endDate) {
        setRange([{
          startDate: startDate ?? new Date(),
          endDate: endDate ?? new Date(),
          key: 'selection'
        }])
        setStartDateText(endDateText)
        setEndDateText(startDateText)
      }
      else 
        setRange([{
          ...range,
          startDate: endDate ?? new Date(),
          endDate: startDate ?? new Date(),
          key: 'selection'
        }])
    } else {
      setCalendar(startDate ?? new Date())
    }
  }

  const onSelectEndDate = () => {
    const startDate = moment(startDateText, 'DD/MM/YYYY').toDate()
    const endDate = moment(endDateText, 'DD/MM/YYYY').toDate()
    if (startDateSelected && endDateSelected) {
      if (startDate > endDate) {
        setRange([{
          startDate: startDate ?? new Date(),
          endDate: endDate ?? new Date(),
          key: 'selection'
        }])
        setStartDateText(endDateText)
        setEndDateText(startDateText)
      }
      else 
        setRange([{
          ...range,
          startDate: endDate ?? new Date(),
          endDate: startDate ?? new Date(),
          key: 'selection'
        }])
    } else {
      setCalendar(endDate ?? new Date())
    }
  }

  const handleSaveDates = () => {
    let datesToSave
    const arrTime = timeText.split(':')
    const hour = arrTime[0]
    const minute = arrTime[1]
    const startDate = Math.floor(moment(startDateText, 'DD/MM/YYYY').toDate().getTime() / 1000)
    console.log('🚀 ~ file: ActiveDatesModal.js:110 ~ handleSaveDates ~ startDate', startDate)
    const endTime = parseInt(hour) * 3600 + parseInt(minute) * 60
    const endDate = Math.floor(moment(endDateText, 'DD/MM/YYYY').toDate().getTime() / 1000) + endTime
    console.log('🚀 ~ file: ActiveDatesModal.js:112 ~ handleSaveDates ~ endDate', endDate)
    const reminderTime = reminder === 'None' ? 0 : endDate - reminders.find((reminder) => reminder.id === idSelect).unixTimeToAdd
    console.log('🚀 ~ file: ActiveDatesModal.js:114 ~ handleSaveDates ~ reminderTime', reminderTime)
    // TH1 : có cả hai start và end
    if( startDateSelected && endDateSelected) {
      if (hour >= 0 && hour <= 23 && minute >= 0 && minute <= 59) {
        datesToSave = {
          dates: {
            startDate: startDate,
            endDate: endDate,
            endTime: endTime,
            reminderTime: reminderTime,
            _finished: false
          }
        }
        if (datesToSave.dates.reminderTime === 0) {
          delete datesToSave.dates.reminderTime
        }
      } else {
        toast.error('Invalid time format!')
        return
      }
    }
    //Th2 Có start và không có end
    else if (startDateSelected && !endDateSelected) {
      datesToSave = {
        dates: {
          startDate: startDate,
          _finished: false
        }
      }
    }
    //Th3 : Không start chỉ có end
    else if (!startDateSelected && endDateSelected) {
      datesToSave = {
        dates: {
          endDate: endDate,
          endTime: endTime,
          reminderTime: reminderTime,
          _finished: false
        }
      }
      if (datesToSave.dates.reminderTime === 0) {
        delete datesToSave.dates.reminderTime
      }
    }
    //TH4 không satrt và không end
    else {
      closeDatesModal()
      return
    }
    updateCardAPI(currentActiveCard._id, datesToSave).then((card) => {
      // dispatch
      dispatch(updateCardInBoard(card))
      dispatch(updateAllInCurrentActiveCard(card))
      closeDatesModal()
    })
  }
  
  const handleTimeText = () => {
    const arrTime = timeText.split(':')
    const hour = arrTime[0]
    const minute = arrTime[1]
    if (hour >= 0 && hour <= 23 && minute >= 0 && minute <= 59) {
      setTimeText(`${ String(parseInt(hour)).padStart(2,'0')}:${ String(parseInt(minute)).padStart(2,'0')}`)
    } else {
      setTimeText(new moment().format('HH:mm'))
    }
  }
  
  return (
    <div className='menu__group__dates-container'>
      <div className="container">
          <div className="menu__group__dates-header">
            <div className=" menu__group__dates-heading">
              <div>Dates</div>
            </div>
            <div 
              className='menu__group__dates-icon'
              onClick={() => closeDatesModal()}
            >
              <i className="fa fa-times"/>
            </div>
          </div>
          <hr className='menu__group__dates-seperator' />
        
      </div>
      <div className='menu__group__dates'>
        { startDateSelected && endDateSelected 
          ?
          <DateRange
            onChange={item => {
              setRange([item.selection])
              setStartDateText(format(item.selection.startDate, 'dd/MM/yyyy'))
              setEndDateText(format(item.selection.endDate, 'dd/MM/yyyy'))
            }}
            editableDateInputs={true}
            moveRangeOnFirstSelection={false}
            ranges={range}
            months={1}
            direction="horizontal"
          />
          :
          <Calendar
            date={ calendar }
            onChange = { handleSelectDate }
          />
        }

        <div className="container">
          <div className="card__element__title">Start date</div>
          <div className='menu__group__dates__date-container'>
          <input 
              type="checkbox"
              checked= {startDateSelected}
              onChange={() => {
                setStartDateSelected(!startDateSelected)
                if (!startDateSelected) {
                  setRange([{
                    startDate: new Date(),
                    endDate: addDays(new Date(), 2),
                    key: 'selection'
                  }])
                  if (endDateSelected) {
                    setStartDateText(format(new Date(), 'dd/MM/yyyy'))
                    setEndDateText(format(addDays(new Date(), 2), 'dd/MM/yyyy'))
                  } else {
                    setEndDateText('dd/MM/yyyy')
                    setStartDateText(format(new Date(), 'dd/MM/yyyy'))
                  }
                } else {
                  setCalendar(new Date())
                  setStartDateText('dd/MM/yyyy')
                  if (endDateSelected)
                    setEndDateText(format(new Date(), 'dd/MM/yyyy'))
                  else
                    setEndDateText('dd/MM/yyyy')
                }
              }}
            ></input>
            <Form.Control 
              size="sm"
              as="input" 
              rows={1}
              value={startDateText}
              onChange={onChangeStartDateText}
              placeholder="dd/mm/yyyy"
              onBlur={onSelectStartDate}
              style={{
                width: '40%',
                pointerEvents: startDateSelected ? 'pointer' : 'none',
                opacity: startDateSelected ? 1 : 0.4,
                cursor: startDateSelected ? 'pointer' : 'not-allowed'
              }}
            />
            
          </div>
          <div className="card__element__title mt-2">Due date</div>
          <div className='menu__group__dates__date-container'>
          <input 
            type="checkbox"
            checked= {endDateSelected}
            onChange={() => {
              setEndDateSelected(!endDateSelected)
              if (!endDateSelected) {
                setRange([{
                  startDate: new Date(),
                  endDate: addDays(new Date(), 2),
                  key: 'selection'
                }])
                
                if (startDateSelected) {
                  setStartDateText(format(new Date(), 'dd/MM/yyyy'))
                  setEndDateText(format(addDays(new Date(), 2), 'dd/MM/yyyy'))
                } else {
                  setEndDateText(format(new Date(), 'dd/MM/yyyy'))
                  setStartDateText('dd/MM/yyyy')
                }
              } else {
                setCalendar(new Date())
                setEndDateText('dd/MM/yyyy')
                if (startDateSelected)
                  setStartDateText(format(new Date(), 'dd/MM/yyyy'))
                else
                setStartDateText('dd/MM/yyyy')
              }
            }}
          ></input>
          <Form.Control 
            size="sm"
            as="input" 
            rows={1}
            value={endDateText}
            onChange={onChangeEndDateText}
            placeholder="dd/mm/yyyy"
            onBlur={onSelectEndDate}
            style={{
              width: '40%',
              pointerEvents: endDateSelected ? 'pointer' : 'none',
              opacity: endDateSelected ? 1 : 0.4,
              cursor: endDateSelected ? 'pointer' : 'not-allowed'
            }}
            />
            <Form.Control 
              size="sm"
              as="input" 
              rows={1}
              value={endDateSelected ? timeText : 'HH:MM'}
              placeholder="HH:MM"
              onChange={(e) => setTimeText(e.target.value)}
              onBlur={handleTimeText}
              style={{
                width: '30%',
                pointerEvents: endDateSelected ? 'pointer' : 'none',
                opacity: endDateSelected ? 1 : 0.4,
                cursor: endDateSelected ? 'pointer' : 'not-allowed',
                marginRight: '10px'
              }}
            />
            <i 
              onClick={() => setTimeText(new moment().format('HH:mm'))}
              className="fa fa-refresh"
              style={{
                pointerEvents: endDateSelected ? 'pointer' : 'none',
                opacity: endDateSelected ? 1 : 0.4,
                cursor: endDateSelected ? 'pointer' : 'not-allowed'
              }}
            />
          </div>
          <div className="card__element__title mt-2">Set due date reminder</div>
          <select 
            onChange={(e) => {
              setReminder(e.target.value)
              console.log('sad: ',  e.target.value)
              setIdSelect(e.target[e.target.selectedIndex].id)
            }} 
            value={reminder}
            className='menu__group__dates-select'
          >
            <option>None</option>
            {
              reminders.map((i) => (
                <option
                  id={i.id} 
                  value={i.text} 
                  key={i.id}
                  className='menu__group__dates-select-item'
                >{i.text}</option>
              ))
            }
          </select>
          <div className='mb-2'>Reminders will be sent to aall members and watchers of this card</div>
          <Button
            variant="primary"
            className='menu__group__dates-btn'
            onClick={handleSaveDates}
          >Save</Button>
          <Button
            variant="light"
            className='menu__group__dates-btn'
            onClick={closeDatesModal}
          >Remove</Button>
        </div>
      </div>
    </div>
  )
}
