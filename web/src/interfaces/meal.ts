import { UserType } from './user'
import { RestaurantType } from './restaurant'

export type MealTypes = 'LUNCH' | 'DINNER' | ''

export interface MealDataListState {
  restaurantId: number,
  lunch: Array<string>,
  dinner: Array<string>
}

export interface MealType {
  id: number,
  mealType: MealTypes,
  eatDate: Date,
  user: UserType,
  restaurantId: number
}

export interface MealPayload {
  date: string
}

export interface MealResponse {
  mealList: MealType[][]
}

export interface MealUpsertPayload {
  date: string,
  mealType: MealTypes,
  restaurantId: number
}

export interface MealDeletePayload {
  date: string,
  mealType: MealTypes
}