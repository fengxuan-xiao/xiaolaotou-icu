
import request from '@/utils/request' // 假设你有一个封装好的 request 工具

/**
 * 获取省份列表
 */
// export function getProvinces() {
//   // 假设后端接口为 /api/area/provinces
//   return request({
//     url: '/area/provinces',
//     method: 'get'
//   })
// }

export function getProvinces() {
  // 模拟返回数据，实际应为: return request.get('/api/provinces')
  return Promise.resolve([
    { value: 'guangdong', label: '广东省' }
  ])
}

/**
 * 根据省份ID获取城市列表
 */
// export function getCities(provinceCode) {
//   // 假设后端接口为 /api/area/cities
//   return request({
//     url: '/area/cities',
//     method: 'get',
//     params: { provinceCode }
//   })
// }
export function getCities(provinceCode) {
  // 模拟返回数据
  const cityMap = {
    zhejiang: [
      { value: 'hangzhou', label: '杭州市' },
      { value: 'ningbo', label: '宁波市' }
    ],
    guangdong: [
      { value: 'guangzhou', label: '广州市' }
    ],
    jiangsu: [
      { value: 'nanjing', label: '南京市' },
      { value: 'suzhou', label: '苏州市' }
    ]
  }
  return Promise.resolve(cityMap[provinceCode] || [])
}

/**
 * 根据城市ID获取区县列表
 */
// export function getDistricts(cityCode) {
//   // 假设后端接口为 /api/area/districts
//   return request({
//     url: '/area/districts',
//     method: 'get',
//     params: { cityCode }
//   })
// }

export function getDistricts(cityCode) {
  // 模拟返回数据
  const districtMap = {
    hangzhou: [
      { value: 'xihu', label: '西湖区' },
      { value: 'yuhang', label: '余杭区' }
    ],
    ningbo: [
      { value: 'haishu', label: '海曙区' },
      { value: 'jiangbei', label: '江北区' }
    ],
    guangzhou: [
      { value: 'tianhe', label: '天河区' }
    ],
    shenzhen: [
      { value: 'nanshan', label: '南山区' },
      { value: 'futian', label: '福田区' }
    ],
    nanjing: [
      { value: 'gulou', label: '鼓楼区' },
      { value: 'xuanwu', label: '玄武区' }
    ],
    suzhou: [
      { value: 'gusu', label: '姑苏区' },
      { value: 'wuzhong', label: '吴中区' }
    ]
  }
  return Promise.resolve(districtMap[cityCode] || [])
}

/**
 * 获取可视化大屏数据
 * @param {Object} data - 查询参数
 */
export function getVisualizationData(data) {
  return request({
    url: '/visualization/data',
    method: 'post',
    data: data
  })
}

// /**
//  * 获取省份列表
//  */
// export function getProvinces() {
//   // 模拟返回数据，实际应为: return request.get('/api/provinces')
//   return Promise.resolve([
//     { value: 'guangdong', label: '广东省' }
//   ])
// }

// /**
//  * 根据省份ID获取城市列表
//  * @param {string} provinceCode - 省份代码
//  */
// export function getCities(provinceCode) {
//   // 模拟返回数据
//   const cityMap = {
//     zhejiang: [
//       { value: 'hangzhou', label: '杭州市' },
//       { value: 'ningbo', label: '宁波市' }
//     ],
//     guangdong: [
//       { value: 'guangzhou', label: '广州市' }
//     ],
//     jiangsu: [
//       { value: 'nanjing', label: '南京市' },
//       { value: 'suzhou', label: '苏州市' }
//     ]
//   }
//   return Promise.resolve(cityMap[provinceCode] || [])
// }

// /**
//  * 根据城市ID获取区县列表
//  * @param {string} cityCode - 城市代码
//  */
// export function getDistricts(cityCode) {
//   // 模拟返回数据
//   const districtMap = {
//     hangzhou: [
//       { value: 'xihu', label: '西湖区' },
//       { value: 'yuhang', label: '余杭区' }
//     ],
//     ningbo: [
//       { value: 'haishu', label: '海曙区' },
//       { value: 'jiangbei', label: '江北区' }
//     ],
//     guangzhou: [
//       { value: 'tianhe', label: '天河区' }
//     ],
//     shenzhen: [
//       { value: 'nanshan', label: '南山区' },
//       { value: 'futian', label: '福田区' }
//     ],
//     nanjing: [
//       { value: 'gulou', label: '鼓楼区' },
//       { value: 'xuanwu', label: '玄武区' }
//     ],
//     suzhou: [
//       { value: 'gusu', label: '姑苏区' },
//       { value: 'wuzhong', label: '吴中区' }
//     ]
//   }
//   return Promise.resolve(districtMap[cityCode] || [])
// }


// /**
//  * 获取可视化大屏数据
//  * @param {Object} params - 查询参数
//  * @param {string} params.province - 省份
//  * @param {string} params.city - 城市
//  * @param {string} params.district - 区县
//  * @param {string} params.startDate - 开始月份 YYYYMM
//  * @param {string} params.endDate - 结束月份 YYYYMM
//  */
// export function getVisualizationData(data) {
//   return request({
//     url: '/visualization/data',
//     method: 'post', // 或者 'get'，取决于后端定义
//     data: data // 如果是 POST 用 data，如果是 GET 用 params
//   })
// }