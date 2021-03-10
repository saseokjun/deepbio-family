import React, { useState, useEffect } from 'react'
import { useQuery, useMutation } from '@apollo/react-hooks'
import { RESTAURANTS, MEAL_LIST } from '../graphql/queries'
import { MEAL_UPSERT, MEAL_DELETE } from '../graphql/mutations'
import { Layout, Meal } from '../components'
import { RestaurantResponse, MealPayload, MealResponse, MealDataListState, MealUpsertPayload, MealDeletePayload, MealTypes } from '../interfaces'
import { SET_LOCAL_STATE, SnackbarInterface } from '../apollo/store'
import { formatDate } from '../utils'

interface Props { }

export const MealContainer: React.FC<Props> = () => {
  const [mealByRestaurant, setMealByRestaurant] = useState<MealDataListState[]>([])
  const [mealUpsertState, setMealUpsertState] = useState<MealUpsertPayload>({
    date: '',
    mealType: '',
    restaurantId: 0
  })
  const [deleteState, setDeleteState] = useState<MealDeletePayload>({
    date: '',
    mealType: '',
  })
  const { data: restaurantData } = useQuery<RestaurantResponse>(RESTAURANTS)
  const { data: mealDataList, refetch } = useQuery<MealResponse, MealPayload>(MEAL_LIST, {
    variables: {
      date: formatDate(new Date())
    },
    fetchPolicy: 'network-only'
  })
  const [mealUpsert] = useMutation<{}, MealUpsertPayload>(MEAL_UPSERT, { variables: mealUpsertState })
  const [mealDelete] = useMutation<{}, MealDeletePayload>(MEAL_DELETE, { variables: deleteState })
  const [setLocalState] = useMutation<SnackbarInterface>(SET_LOCAL_STATE)

  useEffect(() => {
    if (mealDataList) {
      setMealByRestaurant([])
      for (const mealData of mealDataList.mealList) {
        const mealRawData: MealDataListState = {
          restaurantId: 0,
          lunch: [],
          dinner: []
        }
        for (const meal of mealData) {
          mealRawData.restaurantId = meal.restaurantId
          if (meal.mealType === 'LUNCH') {
            mealRawData.lunch.push(meal.user.name)
          } else {
            mealRawData.dinner.push(meal.user.name)
          }
        }
        setMealByRestaurant(prev => [...prev, mealRawData])
      }
    }
  }, [mealDataList])

  useEffect(() => {
    if (mealUpsertState.date !== '') {
      mealUpsert().then(() => {
        refetch()
      })
    }
  }, [mealUpsertState])

  useEffect(() => {
    if (deleteState.date !== '') {
      mealDelete().then(() => {
        refetch()
      })
    }
  }, [deleteState])

  const handleSelect = (restaurantId: number) => {
    const currentHours = new Date().getHours()
    let mealType: MealTypes = ''
    if (currentHours >= 10 && currentHours < 14) {
      mealType = 'LUNCH'
    } else if (currentHours >= 16 && currentHours < 20) {
      mealType = 'DINNER'
    }
    if (mealType !== '') {
      setMealUpsertState({
        date: formatDate(new Date()),
        mealType,
        restaurantId
      })
    } else {
      setLocalState({
        variables: {
          isOpen: true,
          message: '메뉴 선택은 당일 정해진 시간에만 가능합니다.',
          severity: 'error'
        }
      })
    }
  }

  const handleDelete = () => {
    const currentHours = new Date().getHours()
    let mealType: MealTypes = ''
    if (currentHours >= 10 && currentHours < 14) {
      mealType = 'LUNCH'
    } else if (currentHours >= 16 && currentHours < 20) {
      mealType = 'DINNER'
    }
    if (mealType !== '') {
      setDeleteState({
        date: formatDate(new Date()),
        mealType,
      })
    } else {
      setLocalState({
        variables: {
          isOpen: true,
          message: '메뉴 선택은 당일 정해진 시간에만 가능합니다.',
          severity: 'error'
        }
      })
    }
  }

  return <React.Fragment>
    <Layout content={
      <Meal
        restaurantData={restaurantData}
        mealByRestaurant={mealByRestaurant}
        handleSelect={handleSelect}
        handleDelete={handleDelete}
      />
    } />
  </React.Fragment>
}