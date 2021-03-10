import { UserType } from './user'

export type HolidayTypes = 'ALLDAY' | 'AM' | 'PM' | ''

export interface HolidaysDataItemState {
  id: number,
  title: string,
  start: Date,
  end: Date,
  allDay: boolean
}

export interface MyHolidayCountState {
  alternative: number,
  annual: number
}

export interface MyHolidaysDataItemState {
  id: number,
  text: string
}

export interface HolidaysType {
  id: number,
  startDate: Date,
  endDate: Date,
  holidayType: HolidayTypes,
  user: UserType
}

export interface HolidaysPayload {
  searchMonth: string
}

export interface HolidaysResponse {
  holidays: HolidaysType[]
}

export interface MyHolidaysResponse {
  myHolidays: HolidaysType[],
  me: MyHolidayCountState
}

export interface HolidayUpsertPayload {
  holidayId: number,
  startDate: string,
  endDate: string,
  holidayType: HolidayTypes
}

export interface HolidayDeletePayload {
  holidayId: number
}