import gql from 'graphql-tag'

export const MEAL_LIST = gql`
  query(
    $date: Date!
  ){
    mealList(date: $date){
      mealType
      restaurantId
      user{
        name
      }
    }
  }
`