import React from 'react'
import { makeStyles, createStyles } from '@material-ui/core/styles'
import { TextField, Grid, Button } from '@material-ui/core'
import { UserCreatePayload } from '../../interfaces'


interface Props {
  createUserState: UserCreatePayload,
  handleCreateUserState(name: string, value: string): void,
  handleUserCreate(): void,
  findSlackId(username: string): void
}

const useStyles = makeStyles(() =>
  createStyles({
    registerContainer: {
      width: '500px',
      display: 'flex',
      flexDirection: 'column',
      paddingLeft: '30px',
      paddingRight: '30px',
      border: '1px solid #000',
      height: '500px'
    },
    title: {
      width: '100%',
      height: '50px',
      fontSize: '18px',
      lineHeight: '50px',
      textAlign: 'center'
    },
    item: {
      width: '100%',
      textAlign: 'center'
    },
    slackButton: {
      width: '40%',
      padding: 0
    }
  })
)

const Register: React.FC<Props> = (props) => {
  const classes = useStyles()
  const { createUserState, handleCreateUserState, handleUserCreate, findSlackId } = props

  const onChangeCreateUserState = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target as HTMLInputElement
    handleCreateUserState(name, value)
  }

  const onClickFindSlackId = () => {
    const username = createUserState.email.split('@')[0]
    findSlackId(username)
  }

  return <React.Fragment>
    <Grid container className={classes.registerContainer}>
      <Grid item className={classes.title}>계정 생성</Grid>
      <Grid item className={classes.item}>
        <TextField
          type='text'
          name='name'
          style={{ width: '100%' }}
          value={createUserState.name}
          onChange={onChangeCreateUserState}
          required
          label='Name'
        />
      </Grid>
      <Grid item className={classes.item}>
        <TextField
          type='text'
          name='email'
          style={{ width: '100%' }}
          value={createUserState.email}
          onChange={onChangeCreateUserState}
          required
          label='Email'
        />
      </Grid>
      <Grid item className={classes.item} style={{ display: 'flex' }}>
        <TextField
          type='text'
          name='slackId'
          style={{ width: '60%' }}
          value={createUserState.slackId}
          required
          label='Slack ID'
          disabled
        />
        <Button variant='contained' color='default' className={classes.slackButton} onClick={onClickFindSlackId}>
          Slack ID 찾기
        </Button>
      </Grid>
      <Grid item style={{ textAlign: 'right', marginTop: '20px' }}>
        <Button variant='contained' color='primary' onClick={handleUserCreate}>계정생성</Button>
      </Grid>
    </Grid>
  </React.Fragment>
}

export default React.memo(Register)