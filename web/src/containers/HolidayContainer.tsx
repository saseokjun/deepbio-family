import React, { useState, useEffect } from 'react'
import { useQuery, useMutation } from '@apollo/react-hooks'
import { HOLIDAYS, MY_HOLIDAYS } from '../graphql/queries'
import { HOLIDAY_CREATE, HOLIDAY_UPDATE, HOLIDAY_DELETE } from '../graphql/mutations'
import { HolidaysPayload, HolidaysDataItemState, HolidaysResponse, MyHolidaysResponse, HolidayUpsertPayload, HolidayTypes, MyHolidaysDataItemState, MyHolidayCountState, HolidayDeletePayload } from '../interfaces'
import { SET_LOCAL_STATE, SnackbarInterface } from '../apollo/store'
import { Layout, Holiday } from '../components'
import { formatDate } from '../utils'

interface Props { }

export const HolidayContainer: React.FC<Props> = () => {
  const [isModal, setIsModal] = useState<boolean>(false)
  const [isDialog, setIsDialog] = useState<boolean>(false)
  const [searchMonth, setsearchMonth] = useState(formatDate(new Date()).substring(0, 7))
  const [upsertHolidayState, setUpsertHolidayState] = useState<HolidayUpsertPayload>({ holidayId: 0, startDate: '', endDate: '', holidayType: '' })
  const [deleteHolidayId, setDeleteHolidayId] = useState<number>(0)
  const [holidaysDataList, setHolidaysDataList] = useState<HolidaysDataItemState[]>([])
  const [myHolidaysDataList, setMyHolidaysDataList] = useState<MyHolidaysDataItemState[]>([])
  const [myHolidayCountState, setMyHolidayCountState] = useState<MyHolidayCountState>({ alternative: 0, annual: 0 })

  const { data: myHolidaysData, refetch: myHolidaysRefetch } = useQuery<MyHolidaysResponse>(MY_HOLIDAYS, {
    fetchPolicy: 'network-only'
  })
  const { data: holidaysData, refetch: holidaysRefetch } = useQuery<HolidaysResponse, HolidaysPayload>(HOLIDAYS, {
    variables: {
      searchMonth
    },
    fetchPolicy: 'network-only'
  })
  const [holidayCreate] = useMutation<{}, HolidayUpsertPayload>(HOLIDAY_CREATE, { variables: upsertHolidayState })
  const [holidayUpdate] = useMutation<{}, HolidayUpsertPayload>(HOLIDAY_UPDATE, { variables: upsertHolidayState })
  const [holidayDelete] = useMutation<{}, HolidayDeletePayload>(HOLIDAY_DELETE, {
    variables: {
      holidayId: deleteHolidayId
    }
  })
  const [setLocalState] = useMutation<SnackbarInterface>(SET_LOCAL_STATE)

  useEffect(() => {
    if (holidaysData) {
      setHolidaysDataList([])
      for (const raw of holidaysData.holidays) {
        const { id, startDate, endDate, holidayType, user } = raw
        let prefix = ''
        if (holidayType === 'ALLDAY') {
          prefix = '[연차]'
        } else if (holidayType === 'AM') {
          prefix = '[오전]'
        } else if (holidayType === 'PM') {
          prefix = '[오후]'
        }
        setHolidaysDataList(prev => {
          const result = [...prev, {
            id,
            title: `${prefix} ${user.name}`,
            start: startDate,
            end: endDate,
            allDay: holidayType === 'ALLDAY' ? true : false
          }]
          return result
        })
      }
    }
  }, [holidaysData])

  useEffect(() => {
    if (myHolidaysData) {
      setMyHolidaysDataList([])
      setMyHolidayCountState({ alternative: 0, annual: 0 })
      const { myHolidays, me } = myHolidaysData
      setMyHolidayCountState(me)
      for (const raw of myHolidays) {
        const { id, startDate, endDate, holidayType } = raw
        let prefix = ''
        let text = ''
        if (holidayType === 'ALLDAY') {
          prefix = '[연차]'
          text = `${prefix} ${formatDate(startDate)} ~ ${formatDate(endDate)}`
        } else if (holidayType === 'AM') {
          prefix = '[오전]'
          text = `${prefix} ${formatDate(startDate)}`
        } else if (holidayType === 'PM') {
          prefix = '[오후]'
          text = `${prefix} ${formatDate(startDate)}`
        }
        setMyHolidaysDataList(prev => {
          const result = [...prev, {
            id,
            text
          }]
          return result
        })
      }
    }
  }, [myHolidaysData])

  const handleSearchMonth = (day: Date) => {
    const dateString = formatDate(day)
    setsearchMonth(dateString.substring(0, 7))
  }

  const handleUpsertHolidayState = (startDate: Date, endDate: Date, holidayType: HolidayTypes, holidayId: number = 0) => {
    const sDate = formatDate(startDate)
    const eDate = formatDate(endDate)
    setUpsertHolidayState({ holidayId, startDate: sDate, endDate: eDate, holidayType })
    setIsModal(true)
  }

  const handleModalClose = () => {
    setIsModal(false)
  }

  const handleModalConfirm = () => {
    const mutater = upsertHolidayState.holidayId === 0 ? holidayCreate : holidayUpdate
    mutater().then(() => {
      holidaysRefetch()
      myHolidaysRefetch()
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

  const handleMyHolidayDelete = (holidayId: number) => {
    setDeleteHolidayId(holidayId)
    setIsDialog(true)
  }

  const handleDialogClose = () => {
    setIsDialog(false)
  }

  const handleDialogConfirm = () => {
    holidayDelete().then(() => {
      setIsDialog(false)
      setDeleteHolidayId(0)
      holidaysRefetch()
      myHolidaysRefetch()
    }).catch((err) => {
      setLocalState({
        variables: {
          isOpen: true,
          message: err.graphQLErrors[0].message,
          severity: 'error'
        }
      })
    })
  }

  return <React.Fragment>
    <Layout content={
      <Holiday
        holidaysDataList={holidaysDataList}
        myHolidaysDataList={myHolidaysDataList}
        myHolidayCountState={myHolidayCountState}
        handleSearchMonth={handleSearchMonth}
        upsertHolidayState={upsertHolidayState}
        handleUpsertHolidayState={handleUpsertHolidayState}
        isModal={isModal}
        isDialog={isDialog}
        handleModalClose={handleModalClose}
        handleDialogClose={handleDialogClose}
        handleDialogConfirm={handleDialogConfirm}
        handleModalConfirm={handleModalConfirm}
        handleMyHolidayDelete={handleMyHolidayDelete}
      />
    } />
  </React.Fragment>
}