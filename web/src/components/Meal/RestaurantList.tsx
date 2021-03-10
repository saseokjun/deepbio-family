import React, { useCallback } from 'react'
import { makeStyles, createStyles } from '@material-ui/core/styles'
import { Grid, Card, CardContent, CardActionArea } from '@material-ui/core'
import { RestaurantType, RestaurantResponse } from '../../interfaces'
import { stringToColor } from '../../utils'

interface Props {
  restaurantData: RestaurantResponse | undefined,
  handleSelect(restaurantId: number): void,
  handleDelete(): void
}

const useStyles = makeStyles(() =>
  createStyles({
    titleContainer: {
      margin: '-20px 0px -20px 0px'
    },
    deleteContainer: {
      margin: '10px 0px 0px 0px'
    }
  })
)

const RestaurantList: React.FC<Props> = (props) => {
  const classes = useStyles()
  const { restaurantData, handleSelect, handleDelete } = props

  const onClickSelectCard = useCallback((restaurantId: number) => () => {
    handleSelect(restaurantId)
  }, [])

  return <React.Fragment>
    <Grid container direction='column'>
      <Grid container direction='column'>
        <Grid container>
          {restaurantData && restaurantData.restaurants.map((restaurant: RestaurantType) => {
            return (
              <Grid item xs={2} key={`${restaurant.id}`}>
                <Card style={{ background: stringToColor(restaurant.name) }}>
                  <CardActionArea onClick={onClickSelectCard(restaurant.id)}>
                    <CardContent>
                      {restaurant.name}
                    </CardContent>
                  </CardActionArea>
                </Card>
              </Grid>
            )
          })}
        </Grid>
      </Grid>
    </Grid>
    <Grid container className={classes.deleteContainer}>
      <Grid item xs={2}>
        <Card style={{ background: 'rgba(255,0,0,0.7)' }}>
          <CardActionArea onClick={handleDelete}>
            <CardContent>삭제</CardContent>
          </CardActionArea>
        </Card>
      </Grid>
    </Grid>
  </React.Fragment>
}

export default React.memo(RestaurantList)