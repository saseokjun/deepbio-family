import gql from 'graphql-tag'

export const HOLIDAY_CREATE = gql`
  mutation holidayCreate(
    $startDate: Date!,
    $endDate: Date!,
    $holidayType: String!
  ){
    holidayCreate(
      startDate: $startDate,
      endDate: $endDate,
      holidayType: $holidayType
    ){
      holiday{
        id
      }
    }
  }
`

export const HOLIDAY_UPDATE = gql`
  mutation holidayUpdate (
    $holidayId: Int!,
    $startDate: Date!,
    $endDate: Date!,
    $holidayType: String!
  ){
    holidayUpdate(
      holidayId: $holidayId,
      startDate: $startDate,
      endDate: $endDate,
      holidayType: $holidayType
    ){
    holiday{
      id
    }
  }
}
`

export const HOLIDAY_DELETE = gql`
  mutation holidayDelete (
    $holidayId: Int!
  ){
    holidayDelete(
      holidayId: $holidayId
    ){
      response
    }
  }
`