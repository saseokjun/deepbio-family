import React from 'react'
import { Table, TableBody, TableCell, TableContainer, TableHead, TableRow, Paper } from '@material-ui/core'
import { RestaurantType, MealDataListState, RestaurantResponse } from '../../interfaces'

interface Props {
  restaurantData: RestaurantResponse | undefined,
  mealByRestaurant: MealDataListState[]
}

const MealList: React.FC<Props> = (props) => {
  const { restaurantData, mealByRestaurant } = props
  return <React.Fragment>
    <TableContainer component={Paper}>
      <Table stickyHeader>
        <TableHead style={{ background: '#eee' }}>
          <TableRow>
            <TableCell style={{ width: '20%' }}>Restaurant</TableCell>
            <TableCell style={{ width: '40%' }}>점심</TableCell>
            <TableCell style={{ width: '40%' }}>저녁</TableCell>
          </TableRow>
        </TableHead>
        <TableBody>
          {restaurantData && restaurantData.restaurants.map((restaurant: RestaurantType) => {
            const meal = mealByRestaurant.find(mbr => {
              return Number(mbr.restaurantId) === Number(restaurant.id)
            })
            return (
              <TableRow key={restaurant.id}>
                <TableCell>{restaurant.name}</TableCell>
                <TableCell>{meal && meal.lunch.join(', ')}</TableCell>
                <TableCell>{meal && meal.dinner.join(', ')}</TableCell>
              </TableRow>
            )
          })}
        </TableBody>
      </Table>
    </TableContainer>
  </React.Fragment>
}

export default React.memo(MealList)