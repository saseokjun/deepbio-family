export interface AccessDataItemState {
  dayOfTheWeek: string,
  onTime: Date,
  offTime: Date,
  inTime: Date | string,
  outTime: Date | string,
  workingTime: string,
  etc: string
}

export interface AccessType {
  timestamp: Date,
  accessType: string,
}

export interface accessPayload {
  startDate: string,
  endDate: string,
  userId: number
}

export interface accessResponse {
  access: AccessType[]
}

export interface LastAccessResponse {
  lastAccess: AccessType
}