import React from 'react'
import { makeStyles, createStyles } from '@material-ui/core/styles'
import { Table, TableBody, TableCell, TableContainer, TableHead, TableRow, Paper, Box, Select, MenuItem } from '@material-ui/core'
import 'date-fns'
import DateFnsUtils from '@date-io/date-fns'
import { MuiPickersUtilsProvider, KeyboardDatePicker } from '@material-ui/pickers'
import { AccessDataItemState, UsersResponse, UserType, accessPayload, MeResponse } from '../../interfaces'
import { formatDate } from '../../utils'

interface Props {
  accessDataList: AccessDataItemState[],
  handleSearchState(startDate: string, endDate: string, userId: number): void,
  searchState: accessPayload,
  lastAccess: string,
  usersData: UsersResponse | undefined,
  meData: MeResponse | undefined
}

const useStyles = makeStyles(() =>
  createStyles({
    container: {
      height: '80%',
      width: '100%',
      '&::-webkit-scrollbar': {
        display: 'none !important'
      }
    },
    table: {
      overflowY: 'scroll',
      '& th, td': {
        textAlign: 'center'
      },
      '& .MuiTableRow-head': {
        background: '#eee'
      }
    },
    select: {
      margin: '16px 0px 20px 8px',
      height: '100%'
    }
  })
)

export const Access: React.FC<Props> = (props) => {
  const classes = useStyles()
  const { accessDataList, handleSearchState, searchState, lastAccess, usersData, meData } = props
  const { startDate, endDate, userId } = searchState
  const localeOptions = { hour12: false, timeStyle: 'short' }

  const onChangeStartDate = (date: Date | null) => {
    if (date) {
      const sDate = formatDate(date)
      handleSearchState(sDate, endDate, userId)
    }
  }
  const onChangeEndDate = (date: Date | null) => {
    if (date) {
      const eDate = formatDate(date)
      handleSearchState(startDate, eDate, userId)
    }
  }

  const onChangeUserId = (e: React.ChangeEvent<{ value: unknown }>) => {
    const userId = e.target.value
    handleSearchState(startDate, endDate, Number(userId))
  }

  return <React.Fragment>
    <Box>
      ※ 출입 기록은 한 시간 단위로 업데이트 됩니다. (최종 업데이트 시간 : {lastAccess})
    </Box>
    <Box>
      <MuiPickersUtilsProvider utils={DateFnsUtils}>
        <KeyboardDatePicker
          disableToolbar
          variant="inline"
          format="yyyy-MM-dd"
          margin="normal"
          label="From"
          value={new Date(startDate)}
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
          value={new Date(endDate)}
          onChange={onChangeEndDate}
          KeyboardButtonProps={{
            'aria-label': 'change date',
          }}
        />
      </MuiPickersUtilsProvider>
      {meData && meData.me.level === 1 &&
        <Select
          value={userId}
          onChange={onChangeUserId}
          className={classes.select}
        >
          {usersData && usersData.users.map((user: UserType) => {
            return (
              <MenuItem key={user.id} value={user.id}>{user.name}</MenuItem>
            )
          })}
        </Select>
      }
    </Box>
    <TableContainer component={Paper} className={classes.container}>
      <Table stickyHeader className={classes.table}>
        <TableHead>
          <TableRow>
            <TableCell>날짜</TableCell>
            <TableCell>요일</TableCell>
            <TableCell>출근시간</TableCell>
            <TableCell>퇴근시간</TableCell>
            <TableCell>근무시간</TableCell>
            <TableCell>외출/복귀</TableCell>
            <TableCell>기타</TableCell>
          </TableRow>
        </TableHead>
        <TableBody>
          {
            Object.keys(accessDataList).map(dayIndex => {
              if (accessDataList[dayIndex].dayOfTheWeek) {
                return (
                  <TableRow key={dayIndex} hover={true}>
                    <TableCell component='th' scope='row'>
                      {accessDataList[dayIndex].onTime.toLocaleDateString()}
                    </TableCell>
                    <TableCell>{accessDataList[dayIndex].dayOfTheWeek}</TableCell>
                    <TableCell>
                      {accessDataList[dayIndex].onTime.toLocaleTimeString('ko-KR', localeOptions)}
                    </TableCell>
                    <TableCell>
                      {accessDataList[dayIndex].offTime.toLocaleTimeString('ko-KR', localeOptions)}
                    </TableCell>
                    <TableCell>{accessDataList[dayIndex].workingTime}</TableCell>
                    <TableCell>
                      {
                        typeof accessDataList[dayIndex].outTime === 'object'
                        && accessDataList[dayIndex].outTime.toLocaleTimeString('ko-KR', localeOptions)
                      }
                        /
                      {
                        typeof accessDataList[dayIndex].inTime === 'object'
                        && accessDataList[dayIndex].inTime.toLocaleTimeString('ko-KR', localeOptions)
                      }
                    </TableCell>
                    <TableCell>{accessDataList[dayIndex].etc}</TableCell>
                  </TableRow>
                )
              }
            })
          }
        </TableBody>
      </Table>
    </TableContainer>
  </React.Fragment>
}