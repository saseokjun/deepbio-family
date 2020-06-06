export const GRAPHQL_ENDPOINT = `http://localhost:5000/graphql`
export const JWT = {
  HEADER: {
    TOKEN: {
      NAME: 'x-connector-token'
    },
    REFRESH_TOKEN: {
      NAME: 'x-connector-refresh-token'
    }
  },
  LOCAL_STORAGE: {
    TOKEN: {
      NAME: 'connectorToken'
    },
    REFRESH_TOKEN: {
      NAME: 'connectorRefreshToken'
    }
  }
}