import React from 'react'
import { Box } from '@material-ui/core'
import RestaurantList from './RestaurantList'
import MealList from './MealList'
import { MealDataListState, RestaurantResponse } from '../../interfaces'

interface Props {
  restaurantData: RestaurantResponse | undefined,
  mealByRestaurant: MealDataListState[],
  handleSelect(restaurantId: number): void,
  handleDelete(): void
}

export const Meal: React.FC<Props> = (props) => {
  const { restaurantData, mealByRestaurant, handleSelect, handleDelete } = props
  return <React.Fragment>
    <Box style={{ width: '90%' }}>
      <Box>
        ※ 메뉴 선택 및 수정은 당일 정해진 시간에만 가능합니다.<br />
        ※ 점심은 11시 50분까지, 저녁은 17시 50분까지 신청 해주세요.<br />
          점심 : 10:00 ~ 14:00 <br />
          저녁 : 16:00 ~ 20:00 <br />
      </Box>
      <RestaurantList
        restaurantData={restaurantData}
        handleSelect={handleSelect}
        handleDelete={handleDelete}
      />
      <MealList
        restaurantData={restaurantData}
        mealByRestaurant={mealByRestaurant}
      />
    </Box>
  </React.Fragment>
}