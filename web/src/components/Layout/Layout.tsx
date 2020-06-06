import React, { useRef, useState, ReactNode, useEffect } from 'react'
import { Grid, makeStyles, createStyles, Paper, MenuList, MenuItem, Button, Popper, Grow, ClickAwayListener, Modal, TextField, Box, Divider } from '@material-ui/core'
import { Link } from 'react-router-dom'
import { GET_LOCAL_USER, LocalUserInitialState, LocalUserInterface, SET_LOCAL_STATE, SnackbarInterface } from '../../apollo/store'
import { ME } from '../../graphql/queries'
import { useQuery, useMutation } from '@apollo/react-hooks'
import { history } from '../../helpers'
import { USER_CHANGE_PASSWORD } from '../../graphql/mutations'
import { UserChangePasswordPayload, MeResponse } from '../../interfaces'

interface Props {
  content: ReactNode
}

const useStyles = makeStyles(() =>
  createStyles({
    container: {
      display: 'flex',
      flexDirection: 'column',
      width: '100%',
      height: '100%',
      flexWrap: 'nowrap'
    },
    header: {
      width: '100%',
      height: '50px',
      // backgroundColor: 'rgba(104,212,63,0.6)',
      borderBottom: '1px solid #eeeeee',
      display: 'flex',
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'space-between',
      zIndex: 10
    },
    menu: {
      marginRight: '10px'
    },
    body: {
      width: '100%',
      height: '100%',
      flex: 1,
      display: 'flex',
      flexDirection: 'row'
    },
    sidebar: {
      height: '100%',
      width: '200px',
      borderRight: '1px solid #eeeeee',
      '& a': {
        all: 'unset',
        display: 'block',
        width: '100%'
      }
    },
    content: {
      height: '100%',
      flex: 1,
      backgroundColor: 'white',
      display: 'flex',
      flexDirection: 'column'
    },
    modal: {
      position: 'absolute',
      width: 500,
      backgroundColor: 'white',
      border: '2px solid #000',
      top: '50%',
      left: '50%',
      transform: 'translate(-50%, -50%)',
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'center'
    },
    modalTitle: {
      width: '100%',
      height: '50px',
      fontSize: '18px',
      borderBottom: '1px solid #cbcbcb',
      lineHeight: '50px',
      textAlign: 'center'
    },
    modalBody: {
      display: 'flex',
      flexDirection: 'column',
      width: '100%'
    },
    gridItem: {
      width: '100%',
      textAlign: 'center'
    },
    textField: {
      width: '80%',
      height: '60px'
    }
  })
)

export const Layout: React.FC<Props> = ({ content }) => {
  const [isModal, setIsModal] = useState<boolean>(false)
  const [changePasswordState, setChangePasswordstate] = useState<UserChangePasswordPayload>({
    currentPassword: '',
    newPassword: '',
    checkNewPassword: ''
  })
  const [isDropdown, setIsDropdown] = useState<boolean>(false)
  const anchorRef = useRef<HTMLButtonElement>(null)
  const classes = useStyles()
  const { data: userData } = useQuery<MeResponse>(ME)
  const { data: localUserData, client } = useQuery<LocalUserInterface>(GET_LOCAL_USER)
  const [changePassword] = useMutation<UserChangePasswordPayload>(USER_CHANGE_PASSWORD, { variables: changePasswordState })
  const [setLocalState] = useMutation<SnackbarInterface>(SET_LOCAL_STATE)

  useEffect(() => {
    if (userData) {
      const { me } = userData
      const cachedUser = client.readQuery({
        query: GET_LOCAL_USER
      })
      if (cachedUser.user.email === '') {
        const currentUser = me
        client.writeData({ data: { user: currentUser } })
      }
    }
  }, [userData])

  const prevOpen = React.useRef(isDropdown)
  useEffect(() => {
    if (prevOpen.current === true && isDropdown === false) {
      anchorRef.current!.focus()
    }
    prevOpen.current = isDropdown
  }, [isDropdown])

  const onClickName = () => {
    setIsDropdown(prevOpen => !prevOpen)
  }

  const onClickDropdownClose = (e: React.MouseEvent<EventTarget>) => {
    if (anchorRef.current && anchorRef.current.contains(e.target as HTMLElement)) {
      return
    }
    setIsDropdown(false)
  }

  const onClickModalOpen = () => {
    setIsModal(true)
  }

  const onClickModalClose = () => {
    setIsModal(false)
  }

  const onChangePasswordState = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target as HTMLInputElement
    setChangePasswordstate(prevState => ({ ...prevState, [name]: value }))
  }

  const onClickModalConfirm = () => {
    changePassword().then(() => {
      setLocalState({
        variables: {
          isOpen: true,
          message: 'Password changed!',
          severity: 'success'
        }
      })
      setIsModal(false)
    }).catch(err => {
      setLocalState({
        variables: {
          isOpen: true,
          message: err.graphQLErrors[0].message,
          severity: 'error'
        }
      })
    })
  }

  const onClickLogout = () => {
    client.writeData({ data: LocalUserInitialState })
    localStorage.clear()
    history.push('/login')
  }

  return <React.Fragment>
    <Grid container className={classes.container}>
      <Grid item className={classes.header}>
        <Link to='/'><img src='logo.png' /></Link>
        <React.Fragment>
          <Button
            ref={anchorRef}
            aria-controls={isDropdown ? 'menu-list-grow' : undefined}
            aria-haspopup='true'
            onClick={onClickName}
            className={classes.menu}
          >
            {localUserData && localUserData.user.name}님
          </Button>
          <Popper open={isDropdown} anchorEl={anchorRef.current} role={undefined} transition disablePortal>
            {({ TransitionProps, placement }) => (
              <Grow
                {...TransitionProps}
                style={{ transformOrigin: placement === 'bottom' ? 'center top' : 'center bottom' }}
              >
                <Paper>
                  <ClickAwayListener onClickAway={onClickDropdownClose}>
                    <MenuList id='menu-list-grow'>
                      <MenuItem onClick={onClickModalOpen}>
                        비밀번호 변경
                      </MenuItem>
                      <MenuItem onClick={onClickLogout}>
                        로그아웃
                      </MenuItem>
                    </MenuList>
                  </ClickAwayListener>
                </Paper>
              </Grow>
            )}
          </Popper>
        </React.Fragment>
      </Grid>
      <Grid item className={classes.body}>
        <Grid item xs={2} className={classes.sidebar}>
          <Paper elevation={0}>
            <MenuList>
              <MenuItem>
                <Link to='/'>근무 시간</Link>
              </MenuItem>
              <MenuItem>
                <Link to='/holiday'>연차</Link>
              </MenuItem>
              <MenuItem>
                <Link to='/meal'>식사</Link>
              </MenuItem>
              {localUserData && localUserData.user.level === 1 &&
                <div>
                  <Divider style={{ marginTop: '10px', marginBottom: '10px' }} />
                  <MenuItem>
                    <Link to='/register'>계정추가</Link>
                  </MenuItem>
                  <MenuItem>
                    <Link to='/account'>계정관리</Link>
                  </MenuItem>
                </div>
              }
            </MenuList>
          </Paper>
        </Grid>
        <Grid item xs={10} className={classes.content}>
          {content}
        </Grid>
      </Grid>
      <Modal
        open={isModal}
        onClose={onClickModalClose}
      >
        <Grid className={classes.modal}>
          <Grid item className={classes.modalTitle}>비밀번호 변경</Grid>
          <Box className={classes.modalBody}>
            <Grid item className={classes.gridItem}>
              <TextField
                type='password'
                name='currentPassword'
                onChange={onChangePasswordState}
                className={classes.textField}
                required
                label={'현재 비밀번호'}
              />
            </Grid>
            <Grid item className={classes.gridItem}>
              <TextField
                type='password'
                name='newPassword'
                onChange={onChangePasswordState}
                className={classes.textField}
                required
                label='변경할 비밀번호'
              />
            </Grid>
            <Grid item className={classes.gridItem}>
              <TextField
                type='password'
                name='checkNewPassword'
                onChange={onChangePasswordState}
                className={classes.textField}
                required
                label='비밀번호 확인'
              />
            </Grid>
          </Box>
          <Grid item className={classes.gridItem}>
            <Button style={{ color: '#2b7bfc', fontSize: '16px' }} onClick={onClickModalClose}>취소</Button>
            <Button style={{ color: '#2b7bfc', fontSize: '16px' }} onClick={onClickModalConfirm}>확인</Button>
          </Grid>
        </Grid>
      </Modal>
    </Grid>
  </React.Fragment>
}