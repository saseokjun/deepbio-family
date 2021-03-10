import React, { useCallback } from 'react'
import { Box, Modal, Grid, Button, RadioGroup, Radio, FormControl, FormLabel, FormControlLabel, List, ListItem, ListItemText, Dialog, DialogTitle, DialogActions } from '@material-ui/core'
import CancelIcon from '@material-ui/icons/Cancel'
import { makeStyles, createStyles } from '@material-ui/core/styles'
import { MuiPickersUtilsProvider, KeyboardDatePicker } from '@material-ui/pickers'
import DateFnsUtils from '@date-io/date-fns'
import { Calendar, dateFnsLocalizer } from 'react-big-calendar'
import { format, parse, startOfWeek, getDay } from 'date-fns'
import 'react-big-calendar/lib/css/react-big-calendar.css'
import { HolidaysDataItemState, HolidayUpsertPayload, HolidayTypes, MyHolidaysDataItemState, MyHolidayCountState } from '../../interfaces'
const locales = {
  'ko': require('date-fns/locale/ko')
}
interface Props {
  holidaysDataList: HolidaysDataItemState[],
  myHolidaysDataList: MyHolidaysDataItemState[],
  myHolidayCountState: MyHolidayCountState,
  handleSearchMonth(day: Date): void,
  upsertHolidayState: HolidayUpsertPayload,
  handleUpsertHolidayState(startDate: Date | string, endDate: Date | string, holidayType: HolidayTypes, holidayId?: number): void,
  isModal: boolean,
  isDialog: boolean,
  handleModalClose(): void,
  handleDialogClose(): void,
  handleDialogConfirm(): void,
  handleModalConfirm(): void,
  handleMyHolidayDelete(holidayId: number): void
}

const useStyles = makeStyles(() =>
  createStyles({
    container: {
      display: 'flex',
      flexDirection: 'row',
      width: '100%',
      height: '100%'
    },
    calendar: {
      width: '75%',
      height: '90%'
    },
    box: {
      display: 'flex',
      flexDirection: 'column',
      marginLeft: '2%',
      width: '15%',
      height: '90%',
      fontSize: '12pt',
      border: '1px solid black'
    },
    header: {
      width: '100%',
      height: '5%',
      background: '#eee',
      fontSize: '18pt',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center'
    },
    body: {
      width: '100%',
      height: '90%',
      borderTop: '1px solid black',
      borderBottom: '1px solid black',
      '& .MuiListItem-root': {
        '& .MuiSvgIcon-root': {
          display: 'none'
        }
      },
      '& .MuiListItem-root:hover': {
        '& .MuiSvgIcon-root': {
          display: 'inline'
        }
      },
      overflow: 'scroll'
    },
    footer: {
      display: 'flex',
      alignItems: 'center',
      height: '5%',
      background: '#eee',
      padding: '10px'
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
      width: '100%',
      alignItems: 'center'
    },
  })
)

export const Holiday: React.FC<Props> = (props) => {
  const classes = useStyles()
  const { holidaysDataList, myHolidaysDataList, myHolidayCountState, handleSearchMonth, upsertHolidayState, handleUpsertHolidayState, isModal, isDialog, handleModalClose, handleDialogClose, handleDialogConfirm, handleModalConfirm, handleMyHolidayDelete } = props
  const localizer = dateFnsLocalizer({
    format,
    parse,
    startOfWeek,
    getDay,
    locales
  })

  const onChangeStartDate = (date: Date | null) => {
    if (date) {
      handleUpsertHolidayState(date, upsertHolidayState.endDate, upsertHolidayState.holidayType, upsertHolidayState.holidayId)
    }
  }
  const onChangeEndDate = (date: Date | null) => {
    if (date) {
      handleUpsertHolidayState(upsertHolidayState.startDate, date, upsertHolidayState.holidayType, upsertHolidayState.holidayId)
    }
  }
  const onChangeHolidayType = (e: React.ChangeEvent<{ value: any }>) => {
    const { value } = e.target
    handleUpsertHolidayState(upsertHolidayState.startDate, upsertHolidayState.endDate, value, upsertHolidayState.holidayId)
  }

  const onChangeNavigate = (day: Date) => {
    handleSearchMonth(day)
  }

  const onClickMyHoliday = useCallback((holidayId: number) => () => {
    handleMyHolidayDelete(holidayId)
  }, [])

  return <React.Fragment>
    <Box className={classes.container}>
      <Calendar
        selectable
        className={classes.calendar}
        localizer={localizer}
        events={holidaysDataList}
        views={['month']}
        onNavigate={onChangeNavigate}
        onSelectSlot={({ start, end }) => {
          handleUpsertHolidayState(start, end, 'ALLDAY')
        }}
        onSelectEvent={(event => {
          const { id, start, end, title, allDay } = event
          let holidayType: HolidayTypes = ''
          if (allDay) {
            holidayType = 'ALLDAY'
          } else {
            holidayType = title.includes('오전') ? 'AM' : 'PM'
          }
          const endDate = new Date(end)
          endDate.setDate(endDate.getDate() - 1)
          handleUpsertHolidayState(start, endDate, holidayType, id)
        })}
        popup={true}
      />
      <Box className={classes.box}>
        <Box className={classes.header}>연차 사용내역</Box>
        <List component="nav" className={classes.body}>
          {myHolidaysDataList.map(data => {
            return (
              <ListItem button key={data.id} onClick={onClickMyHoliday(data.id)}>
                <ListItemText primary={data.text} />
                <CancelIcon />
              </ListItem>
            )
          })}
        </List>
        <Box className={classes.footer}>
          남은 연차 : {myHolidayCountState.annual}개 <br />
          남은 대체휴무 : {myHolidayCountState.alternative}개
        </Box>
      </Box>
    </Box>
    <Modal
      open={isModal}
      onClose={handleModalClose}
    >
      <Grid className={classes.modal}>
        <Grid item className={classes.modalTitle}>연차/반차 사용</Grid>
        <Box className={classes.modalBody}>
          <MuiPickersUtilsProvider utils={DateFnsUtils}>
            <KeyboardDatePicker
              disableToolbar
              variant="inline"
              format="yyyy-MM-dd"
              margin="normal"
              label="From"
              value={new Date(upsertHolidayState.startDate)}
              style={{ width: '90%' }}
              onChange={onChangeStartDate}
              KeyboardButtonProps={{
                'aria-label': 'change date',
              }}
            />
            <KeyboardDatePicker
              disableToolbar
              variant="inline"
              format="yyyy-MM-dd"
              margin="normal"
              label="To"
              value={new Date(upsertHolidayState.endDate)}
              style={{ width: '90%' }}
              onChange={onChangeEndDate}
              KeyboardButtonProps={{
                'aria-label': 'change date',
              }}
            />
          </MuiPickersUtilsProvider>
          <FormControl component="fieldset" style={{ marginTop: '15px', width: '90%' }}>
            <FormLabel component="legend">종류</FormLabel>
            <RadioGroup value={upsertHolidayState.holidayType} onChange={onChangeHolidayType} row style={{ width: '90%', marginBottom: '15px' }}>
              <FormControlLabel value="ALLDAY" control={<Radio />} label="연차" />
              <FormControlLabel value="AM" control={<Radio />} label="오전반차" />
              <FormControlLabel value="PM" control={<Radio />} label="오후반차" />
            </RadioGroup>
          </FormControl>
        </Box>
        <Grid item style={{ width: '100%', textAlign: 'center' }}>
          <Button style={{ color: '#2b7bfc', fontSize: '16px' }} onClick={handleModalClose}>취소</Button>
          <Button style={{ color: '#2b7bfc', fontSize: '16px' }} onClick={handleModalConfirm}>확인</Button>
        </Grid>
      </Grid>
    </Modal>
    <Dialog
      open={isDialog}
      onClose={handleDialogClose}
    >
      <DialogTitle>연차/반차를 삭제 하시겠습니까?</DialogTitle>
      <DialogActions>
        <Button onClick={handleDialogClose} color="primary">
          취소
        </Button>
        <Button onClick={handleDialogConfirm} color="primary">
          삭제
        </Button>
      </DialogActions>
    </Dialog>
  </React.Fragment>
}