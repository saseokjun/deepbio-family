import React, { useEffect, useState } from 'react'
import { Access, Layout } from '../components'
import { useQuery, useLazyQuery } from '@apollo/react-hooks'
import { ACCESS, LAST_ACCESS, USERS, ME } from '../graphql/queries'
import { accessResponse, AccessType, AccessDataItemState, accessPayload, LastAccessResponse, UsersResponse, MeResponse } from '../interfaces'
import { formatDate } from '../utils'
import { isToday } from 'date-fns/esm'

interface Props { }

const getThisWeek = () => {
  const today = new Date()
  const weekIndex = [0, 1, 2, 3, 4, 5, 6]
  const dayOfWeekIndex = weekIndex[today.getDay()]
  const thisWeekStartDate = new Date()
  thisWeekStartDate.setDate(today.getDate() - dayOfWeekIndex + 1)
  const thisWeekEndDate = new Date()
  thisWeekEndDate.setDate(today.getDate() - dayOfWeekIndex + 7)

  return {
    thisWeekStartDate: formatDate(thisWeekStartDate),
    thisWeekEndDate: formatDate(thisWeekEndDate)
  }
}

const workingTimeCalculator = (onTime: Date, offTime: Date, inTime: Date | string, outTime: Date | string) => {
  let workingTime: number
  if (outTime && inTime) {
    workingTime = (offTime.getTime() - onTime.getTime() - new Date(inTime).getTime() + new Date(outTime).getTime()) / 1000 / 3600
  } else {
    workingTime = (offTime.getTime() - onTime.getTime()) / 1000 / 3600
  }
  const hours = Math.floor(workingTime)
  const minutes = Math.floor((workingTime % 1) * 60)
  return `${hours}시간 ${minutes}분`
}

export const AccessContainer: React.FC<Props> = () => {
  const [accessDataList, setAccessDataList] = useState<AccessDataItemState[]>([])
  const [lastAccess, setLastAccess] = useState<string>('')
  const { thisWeekStartDate, thisWeekEndDate } = getThisWeek()
  const [searchState, setSearchState] = useState<accessPayload>({
    startDate: thisWeekStartDate,
    endDate: thisWeekEndDate,
    userId: 0
  })
  const { data: usersData } = useQuery<UsersResponse>(USERS)
  const [execute, { data: accessData }] = useLazyQuery<accessResponse, accessPayload>(ACCESS, {
    variables: {
      startDate: searchState.startDate,
      endDate: searchState.endDate,
      userId: searchState.userId
    },
    fetchPolicy: 'network-only'
  })
  const { data: lastAccessData } = useQuery<LastAccessResponse>(LAST_ACCESS)
  const { data: meData } = useQuery<MeResponse>(ME)
  const handleSearchState = (startDate: string, endDate: string, userId: number) => {
    setAccessDataList([])
    setSearchState({ startDate, endDate, userId })
  }

  useEffect(() => {
    if (meData) {
      const { id } = meData.me
      setSearchState(prev => ({ ...prev, userId: id }))
      execute()
    }
  }, [meData])

  useEffect(() => {
    if (lastAccessData) {
      setLastAccess(lastAccessData.lastAccess.timestamp.toString().replace('T', ' ').split('.')[0])
    }
  }, [lastAccessData])

  useEffect(() => {
    if (accessData) {
      setAccessDataList([])
      const accessRawDataArray: Array<Array<AccessType>> = []
      let accessRawData: Array<AccessType> = []
      for (const accessLog of accessData.access) {
        const { accessType, timestamp } = accessLog
        if (isToday(new Date(timestamp))) {
          if (accessRawData.length !== 0) {
            accessRawDataArray.push(accessRawData)
            accessRawData = []
          }
          if (accessRawDataArray[accessRawDataArray.length - 1] && isToday(new Date(accessRawDataArray[accessRawDataArray.length - 1][0].timestamp))) {
            const temp = accessRawDataArray.pop()
            if (temp) {
              temp.push(accessLog)
              accessRawDataArray.push(temp)
            }
          } else {
            accessRawData.push(accessLog)
            accessRawDataArray.push(accessRawData)
            accessRawData = []
          }
        } else {
          if (accessType === 'ON') {
            if (accessRawData.length !== 0) {
              accessRawDataArray.push(accessRawData)
              accessRawData = []
            }
            accessRawData.push(accessLog)
          } else if (accessType === 'OFF') {
            accessRawData.push(accessLog)
            accessRawDataArray.push(accessRawData)
            accessRawData = []
          } else {
            accessRawData.push(accessLog)
          }
        }
      }
      const weekIndex = ['일', '월', '화', '수', '목', '금', '토']
      for (const rawDataArray of accessRawDataArray) {
        if (rawDataArray.length < 2 && rawDataArray[0].accessType === 'ACCESS') {
          continue
        }
        const accessData: AccessDataItemState = {
          dayOfTheWeek: '',
          onTime: new Date(),
          offTime: new Date(),
          inTime: '',
          outTime: '',
          workingTime: '',
          etc: ''
        }
        const firstAccess = rawDataArray[0]
        const lastAccess = rawDataArray[rawDataArray.length - 1]
        if (firstAccess.accessType !== 'ON') {
          accessData.etc += '출근 기록 없음\n'
        }
        if (lastAccess.accessType !== 'OFF') {
          accessData.etc += '퇴근 기록 없음\n'
        }

        for (const idx in rawDataArray) {
          if (rawDataArray[idx].accessType === 'OUT') {
            accessData.outTime = new Date(rawDataArray[idx].timestamp)
            if (accessData.inTime === '' && Number(idx) !== rawDataArray.length) {
              if (rawDataArray[Number(idx) + 1]) {
                accessData.inTime = new Date(rawDataArray[Number(idx) + 1].timestamp)
              }
            }
          } else if (rawDataArray[idx].accessType === 'IN') {
            accessData.inTime = new Date(rawDataArray[idx].timestamp)
            if (accessData.outTime === '') {
              accessData.outTime = new Date(rawDataArray[Number(idx) - 1].timestamp)
            }
          }
        }

        accessData.onTime = new Date(firstAccess.timestamp)
        accessData.dayOfTheWeek = weekIndex[accessData.onTime.getDay()]
        accessData.offTime = new Date(lastAccess.timestamp)
        const workingTime = workingTimeCalculator(accessData.onTime, accessData.offTime, accessData.inTime, accessData.outTime)
        accessData.workingTime = workingTime
        setAccessDataList(prev => [...prev, accessData])
      }
    }
  }, [accessData])

  return <React.Fragment>
    <Layout content={
      <Access
        accessDataList={accessDataList}
        lastAccess={lastAccess}
        handleSearchState={handleSearchState}
        searchState={searchState}
        usersData={usersData}
        meData={meData}
      />
    } />
  </React.Fragment>
}