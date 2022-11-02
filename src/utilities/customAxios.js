import axios from 'axios'

import { toast } from 'react-toastify'




let authorizedAxiosInstance = axios.create()
//after 10 minutes api will timeout 
authorizedAxiosInstance.defaults.timeout = 1000 * 60 * 10
// https://axios-http.com/docs/interceptors

const updateSendingApiStatus = (sending = true) => {
  const submits = document.querySelectorAll('.tqd-send')
  for (let i = 0; i < submits.length; i++) {
    if (sending) submits[i].classList.add('tqd-waiting')
    else submits[i].classList.remove('tqd-waiting')
  }
}

// Add a request interceptor
// Can thiệp vào giữa request gửi đi
authorizedAxiosInstance.interceptors.request.use(function (config) {
  // Do something before request is sent

  updateSendingApiStatus(true)

  return config
}, function (error) {
  // Do something with request error
  return Promise.reject(error)
})

// Add a response interceptor
// Can thiệp vào giữa response trả về
authorizedAxiosInstance.interceptors.response.use(function (response) {
  //Bắt lỗi nằm trong ngoài phạm vi 200-299
  // Any status code that lie within the range of 2xx cause this function to trigger
  // Do something with response data

  updateSendingApiStatus(false)
  return response
}, function (error) {

  updateSendingApiStatus(false)
  //Bắt lỗi nằm ngoài phạm vi 200-299
  // Any status codes that falls outside the range of 2xx cause this function to trigger
  // Do something with response error
  let errorMessage = error?.message

  if(error.response?.data?.errors)
    errorMessage = error.response?.data?.errors
  toast.error(errorMessage)

  return Promise.reject(error)
})

export default authorizedAxiosInstance