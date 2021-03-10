export interface RestaurantType {
  id: number,
  name: string,
  billType: string
}

export interface RestaurantResponse {
  restaurants: RestaurantType[]
}