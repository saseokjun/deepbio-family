import React, { useCallback } from 'react'
import { makeStyles, createStyles } from '@material-ui/core/styles'
import { Grid, Table, TableBody, TableCell, TableContainer, TableHead, TableRow, Paper, Button, Modal, RadioGroup, Radio, FormControl, FormLabel, FormControlLabel, Box, TextField } from '@material-ui/core'
import { MuiPickersUtilsProvider, KeyboardDatePicker } from '@material-ui/pickers'
import DateFnsUtils from '@date-io/date-fns'
import { UserUpdatePayload, UsersResponse, UserType } from '../../interfaces'
import { formatDate } from '../../utils'

interface Props {
  usersData: UsersResponse | undefined,
  isModal: boolean,
  handleModalClose(): void,
  handleModalConfirm(): void,
  updateUserState: UserUpdatePayload,
  handleFetchUserState(userId: number): void,
  handleUpdateUserState(name: string, value: any): void,
  handleResetPassword(userId: number): void
}

const useStyles = makeStyles(() =>
  createStyles({
    container: {
      display: 'flex',
      flexDirection: 'row',
      height: '90%'
    },
    table: {
      overflowY: 'scroll',
      '& th, td': {
        textAlign: 'center'
      },
      '& .MuiTableRow-head': {
        background: '#eee'
      },
      '& .MuiTableCell-root': {
        padding: '8px'
      },
      '& .MuiInputBase-input': {
        textAlign: 'center'
      }
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
      alignItems: 'center',
      padding: '25px'
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
  })
)

export const Account: React.FC<Props> = (props) => {
  const classes = useStyles()
  const { usersData, isModal, handleModalClose, handleModalConfirm, updateUserState, handleFetchUserState, handleUpdateUserState, handleResetPassword } = props

  const onClickModify = useCallback((userId: number) => () => {
    handleFetchUserState(userId)
  }, [])

  const onChangeUpdateUserState = (e: React.ChangeEvent<any>) => {
    const { name, value } = e.target as HTMLInputElement
    handleUpdateUserState(name, value)
  }

  const onChangeEnterDate = (date: Date | null) => {
    if (date) {
      handleUpdateUserState('enterDate', formatDate(date))
    }
  }

  const onChangeisJoinType = (e: React.ChangeEvent<{ value: any }>) => {
    const { value } = e.target
    handleUpdateUserState('isJoin', value === 'true')
  }

  const onClickResetPassword = ((userId: number) => () => {
    handleResetPassword(userId)
  })

  return <React.Fragment>
    <Grid container className={classes.container}>
      <TableContainer component={Paper} className={classes.container}>
        <Table stickyHeader className={classes.table}>
          <TableHead style={{ background: '#eee', textAlign: 'center' }}>
            <TableRow>
              <TableCell style={{ width: '17%' }}>Email</TableCell>
              <TableCell style={{ width: '10%' }}>이름</TableCell>
              <TableCell style={{ width: '10%' }}>등급</TableCell>
              <TableCell style={{ width: '10%' }}>연차</TableCell>
              <TableCell style={{ width: '10%' }}>대체휴무</TableCell>
              <TableCell style={{ width: '23%' }}>입사일</TableCell>
              <TableCell style={{ width: '10%' }}>재직여부</TableCell>
              <TableCell style={{ width: '10%' }}></TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {usersData && usersData.users.map((user: UserType) => {
              return (
                <TableRow key={user.id} hover={true}>
                  <TableCell>{user.email}</TableCell>
                  <TableCell>{user.name}</TableCell>
                  <TableCell>{user.level ? 'admin' : 'family'}</TableCell>
                  <TableCell>{user.annual}</TableCell>
                  <TableCell>{user.alternative}</TableCell>
                  <TableCell>{user.enterDate.slice(0, 10)}</TableCell>
                  <TableCell>{user.isJoin ? '재직중' : '퇴사'}</TableCell>
                  <TableCell>
                    <Button variant='contained' color='default' onClick={onClickModify(user.id)}>
                      수정
                  </Button>
                  </TableCell>
                </TableRow>
              )
            })}
          </TableBody>
        </Table>
      </TableContainer>
      <Modal
        open={isModal}
        onClose={handleModalClose}
      >
        <Grid className={classes.modal}>
          <Grid item className={classes.modalTitle}>계정 정보 수정</Grid>
          <Box className={classes.modalBody}>
            <TextField
              type='text'
              name='annual'
              style={{ width: '100%' }}
              value={updateUserState.annual}
              onChange={onChangeUpdateUserState}
              label='연차'
              margin='normal'
            />
            <TextField
              type='text'
              name='alternative'
              style={{ width: '100%' }}
              value={updateUserState.alternative}
              onChange={onChangeUpdateUserState}
              label='대체휴무'
              margin='normal'
            />
            <MuiPickersUtilsProvider utils={DateFnsUtils}>
              <KeyboardDatePicker
                disableToolbar
                variant='inline'
                format='yyyy-MM-dd'
                margin='normal'
                label='입사일'
                value={new Date(updateUserState.enterDate)}
                onChange={onChangeEnterDate}
                KeyboardButtonProps={{
                  'aria-label': 'change date',
                }}
              />
            </MuiPickersUtilsProvider>
            <FormControl component='fieldset' style={{ marginTop: '15px' }}>
              <FormLabel component='legend'>재직여부</FormLabel>
              <RadioGroup
                value={updateUserState.isJoin}
                onChange={onChangeisJoinType}
                name='isJoin'
                row style={{ width: '90%' }}
              >
                <FormControlLabel value={true} control={<Radio />} label='재직중' />
                <FormControlLabel value={false} control={<Radio />} label='퇴사' />
              </RadioGroup>
            </FormControl>
            <FormControl component='fieldset' style={{ marginTop: '15px' }}>
              <FormLabel component='legend'>등급</FormLabel>
              <RadioGroup
                value={String(updateUserState.level)}
                onChange={onChangeUpdateUserState}
                name='level'
                row style={{ width: '90%' }}
              >
                <FormControlLabel value='0' control={<Radio />} label='family' />
                <FormControlLabel value='1' control={<Radio />} label='admin' />
              </RadioGroup>
            </FormControl>
          </Box>
          <Grid item style={{ width: '100%', textAlign: 'center' }}>
            <Button style={{ color: '#2b7bfc', fontSize: '16px' }} onClick={handleModalClose}>닫기</Button>
            <Button style={{ color: '#2b7bfc', fontSize: '16px' }} onClick={onClickResetPassword(updateUserState.userId)}>비밀번호 초기화</Button>
            <Button style={{ color: '#2b7bfc', fontSize: '16px' }} onClick={handleModalConfirm}>수정</Button>
          </Grid>
        </Grid>
      </Modal>
    </Grid>
  </React.Fragment>
}