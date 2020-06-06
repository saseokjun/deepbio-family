import React from 'react'
import { TextField, Button, Container, CssBaseline, Typography, Paper } from '@material-ui/core'
import { makeStyles, createStyles, Theme } from '@material-ui/core/styles'

interface Props {
  loginState: { email: string, password: string },
  handleLoginState(e: React.ChangeEvent<HTMLInputElement>): void,
  handleLogin(): void
}

const useStyles = makeStyles((theme: Theme) =>
  createStyles({
    container: {
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      width: '100%',
      height: '100%'
    },
    paper: {
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'center',
      padding: '5px'
    },
    form: {
      width: '100%', // Fix IE 11 issue.
      marginTop: theme.spacing(1),
    },
    submit: {
      margin: theme.spacing(3, 0, 2),
    },
  }),
)

export const Login: React.FC<Props> = (props) => {
  const classes = useStyles()
  const { loginState, handleLoginState, handleLogin } = props

  const onKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter') {
      handleLogin()
    }
  }
  return <React.Fragment>
    <Container component="main" maxWidth="xs" className={classes.container}>
      <CssBaseline />
      <Paper className={classes.paper} elevation={3}>
        <Typography component="h1" variant="h5">
          Deepbio-Family
        </Typography>
        <div className={classes.form}>
          <TextField
            variant="outlined"
            margin="normal"
            required
            fullWidth
            id="email"
            label="Email Address"
            name="email"
            autoComplete="email"
            autoFocus
            value={loginState.email}
            onChange={handleLoginState}
          />
          <TextField
            variant="outlined"
            margin="normal"
            required
            fullWidth
            name="password"
            label="Password"
            type="password"
            id="password"
            value={loginState.password}
            onChange={handleLoginState}
            onKeyDown={onKeyDown}
          />
          {/* <FormControlLabel
            control={<Checkbox value="remember" color="primary" />}
            label="Remember me"
          /> */}
          <Button
            type="submit"
            fullWidth
            variant="contained"
            color="primary"
            className={classes.submit}
            onClick={handleLogin}
          >
            Sign In
          </Button>
          {/* <Grid container>
            <Grid item xs>
              <Link href="#" variant="body2">
                Forgot password?
              </Link>
            </Grid>
            <Grid item>
              <Link href="#" variant="body2">
                {"Don't have an account? Sign Up"}
              </Link>
            </Grid>
          </Grid> */}
        </div>
      </Paper>
    </Container>
  </React.Fragment>
}