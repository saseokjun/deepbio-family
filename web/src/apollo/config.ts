export const GRAPHQL_ENDPOINT = `http://192.168.0.151:5005/graphql`
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
