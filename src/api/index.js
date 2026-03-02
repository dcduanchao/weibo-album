import axios from 'axios'

const api = axios.create({
  baseURL: import.meta.env.VITE_API_BASE_URL,
  timeout: 30000
})

// 递归替换 URL 中的域名
const replaceUrlDomain = (data) => {
  if (!data) return data
  
  if (typeof data === 'string') {
    return data.replace(/192\.168\.30\.33/g, '155.94.170.142')
  }
  
  if (Array.isArray(data)) {
    return data.map(item => replaceUrlDomain(item))
  }
  
  if (typeof data === 'object') {
    const result = {}
    for (const key in data) {
      result[key] = replaceUrlDomain(data[key])
    }
    return result
  }
  
  return data
}

// 响应拦截器
api.interceptors.response.use(
  response => {
    // 检查是否为生产环境
    const isProduction = import.meta.env.VITE_BASE_URL === '/wei_bo/'
    
    if (isProduction && response.data) {
      response.data = replaceUrlDomain(response.data)
    }
    
    return response
  },
  error => {
    return Promise.reject(error)
  }
)

// 抓取相册
export const fetchAlbum = (uid) => {
  return api.post('/crawl', { uid })
}

// 获取抓取记录
export const getRecords = (page = 1, pageSize = 10) => {
  return api.get('/records', {
    params: { page, page_size: pageSize }
  })
}

// 获取相册列表
export const getAlbumList = (uid, page = 1, pageSize = 12) => {
  return api.get('/album', {
    params: { uid, page, page_size: pageSize }
  })
}

// 更新相册
export const updateAlbum = (data) => {
  return api.post('/album/update', data)
}

// 删除相册
export const deleteAlbum = (id) => {
  return api.get('/album/delete', {
    params: { id }
  })
}

// 获取修改记录
export const getUpdateRecord = (id) => {
  return api.get('/album/update/record', {
    params: { id }
  })
}

// 删除修改记录
export const deleteRecord = (id) => {
  return api.get('/album/record/delete', {
    params: { id }
  })
}

export default api
