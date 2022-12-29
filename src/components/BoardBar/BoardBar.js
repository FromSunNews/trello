import React, { useEffect, useState } from 'react'
import { Container as BootstrapContainer, Row, Col, Form, Button } from 'react-bootstrap'

import './BoardBar.scss'

import {
  fetchFullBoardDetailsAPI,
  selectCurrentFullBoard,
  addUserToBoard
} from 'redux/activeBoard/activeBoardSlice'

import { useDispatch, useSelector } from 'react-redux'
import UserAvatar from 'components/Common/UserAvatar'
import UserSelectPopover from 'components/Common/UserSelectPopover'
import { USER_SELECT_POPOVER_TYPE_BOARD_MEMBERS } from 'utilities/constants'

import {
  EMAIL_RULE,
  FIELD_REQUIRED_MESSAGE,
  EMAIL_RULE_MESSAGE,
  fieldErrorMessage
} from 'utilities/validators'

import { useForm } from 'react-hook-form'

import { inviteUserToBoardAPI } from 'actions/ApiCall'

import { socketIoInstance } from 'index'
import { useParams } from 'react-router-dom'
import { selectCurrentUser } from 'redux/user/userSlice'

function BoardBar() {

  const board = useSelector(selectCurrentFullBoard)
  const user = useSelector(selectCurrentUser)
  const { boardId } = useParams()
  const dispatch = useDispatch()
  const [showInvitePopup, setShowInvitePopup] = useState(false);

  const toggleShowInvitePopup = () => setShowInvitePopup(!showInvitePopup);

  const { register, handleSubmit, setValue, formState: { errors } } = useForm();

  useEffect(() => {
    // dispatch(fetchFullBoardDetailsAPI(boardId))
    console.log('Lang nghe s_user_accepted_invitation_to_board !', board)

    socketIoInstance.on('s_user_accepted_invitation_to_board', (invitation) => {
        // Thêm cái bản ghi user mới vào redux đối với tất cả những người khác trong board
        console.log('Tao goi dispatch addUserToBoard ne')
        dispatch(addUserToBoard({...invitation, currentUserId: user._id}))
    })
  }, [dispatch, user._id])

  const onSubmitInvitation = (data) => {
    console.log('data: ', data);
    // Ở đây thì data sẽ là object mình phải lấy ra đc key tương ứng như lúc đặt tên ở register Form.Control
    const { inviteeEmail } = data
    const boardId = board._id

    inviteUserToBoardAPI({inviteeEmail, boardId})
    .then((invitation) => {
      setValue('inviteeEmail', null)
      socketIoInstance.emit('c_user_invited_to_board', invitation)
    })
  }
  
  return (
    <nav className="navbar-board">
      <BootstrapContainer className="trungquandev-trello-container">
        <Row>
          <Col md={10} sm={12} className="col-no-padding">
            <div className="board-info">
              <div className="item board-logo-icon">
                <i className="fa fa-coffee me-2" />
                <strong>{board?.title}</strong>
              </div>
              <div className="divider"></div>

              <div className="item board-type">Private Workspace</div>
              <div className="divider"></div>

              <div className="item member__avatars">
                {board?.users.map((u, index) => {
                  if (index <= 2) {
                    return (
                      <div className="member__avatars__item" key={index}>
                        <UserAvatar user={u} width="28px" height='28px' />
                      </div>
                    )
                  }
                })}

                {(board?.totalUsers - 3) > 0 &&
                  <div className="member__avatars__item">
                    <UserSelectPopover
                      label={`+${board?.totalUsers - 3}`}
                      users={board?.users}
                      type={USER_SELECT_POPOVER_TYPE_BOARD_MEMBERS}
                    />
                  </div>
                }

                <div className="member__avatars__item">
                  <div className="invite">
                    <div className="invite__label" onClick={toggleShowInvitePopup}>Invite</div>
                    {showInvitePopup &&
                      <div className="invite__popup">
                        <span className="invite__popup__close_btn" onClick={toggleShowInvitePopup}>
                          <i className="fa fa-close" />
                        </span>
                        <div className="invite__popup__title mb-2">Invite user to this board!</div>
                        <div className="invite__popup__form">
                          <Form className="common__form" onSubmit={handleSubmit(onSubmitInvitation)}>
                            <Form.Control
                              type="text"
                              className="invite__field mb-2"
                              placeholder="Enter email to invite..."
                              {...register('inviteeEmail', {
                                required: FIELD_REQUIRED_MESSAGE,
                                pattern: {
                                  value: EMAIL_RULE,
                                  message: EMAIL_RULE_MESSAGE
                                }
                              })}
                            />
                            {fieldErrorMessage(errors, 'inviteeEmail')}
                            <Form.Group className="text-right">
                              <Button variant="success" type="submit" size="sm" className="px-4">Invite</Button>
                            </Form.Group>
                          </Form>
                        </div>
                      </div>
                    }
                  </div>
                </div>

              </div>
            </div>
          </Col>
          <Col md={2} sm={12} className="col-no-padding">
            <div className="board-actions">
              <div className="item menu">
                <i className="fa fa-ellipsis-h me-2" />Show menu
              </div>
            </div>
          </Col>
        </Row>
      </BootstrapContainer>
    </nav>
  )
}

export default BoardBar
