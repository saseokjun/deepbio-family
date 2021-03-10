import gql from 'graphql-tag'

export const HOLIDAYS = gql`
  query(
    $searchMonth: Date!
  ){
    holidays(
      searchMonth: $searchMonth
    ){
      id
      startDate
      endDate
      holidayType
      user{
        name
      }
    }
  }
`

export const MY_HOLIDAYS = gql`
  query{
    myHolidays{
      id
      startDate
      endDate
      holidayType
    }
    me{
      alternative
      annual
    }
  }
`