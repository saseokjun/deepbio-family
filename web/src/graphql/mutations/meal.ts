import gql from 'graphql-tag'

export const MEAL_UPSERT = gql`
  mutation mealUpsert(
    $date: Date!,
    $mealType: String!,
    $restaurantId: Int!
  ){
    mealUpsert(
      date: $date,
      mealType: $mealType,
      restaurantId: $restaurantId
    ){
      response
    }
  }
`

export const MEAL_DELETE = gql`
  mutation mealDelete(
    $date: Date!,
    $mealType: String!
  ){
    mealDelete(
      date: $date,
      mealType: $mealType,
    ){
      response
    }
  }
`