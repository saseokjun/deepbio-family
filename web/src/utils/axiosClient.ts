import axios, { AxiosRequestConfig } from 'axios'

const baseURL = `http://localhost:5000`
const baseConfig: AxiosRequestConfig = {
  timeout: 20000,
  withCredentials: true
}

const axiosGet = (url: string, config?: AxiosRequestConfig) => {
  return axios.create(baseConfig).get(url, config)
}

const axiosPost = (url: string, requestBody?: any, config?: AxiosRequestConfig) => {
  return axios.create(baseConfig).post(url, requestBody, config)
}


export const slackAPI = (username: string) => axiosGet(`${baseURL}/slackId/${username}`)