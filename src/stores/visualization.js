// src/stores/area.js
import { defineStore } from 'pinia'
import { ref } from 'vue'
import { getProvinces, getCities, getDistricts } from '@/api/visualization'

export const useAreaStore = defineStore('area', () => {
  // 状态
  const provinces = ref([])
  const cities = ref([])
  const districts = ref([])
  
  const loading = ref(false)

  // Actions
  
  /**
   * 初始化加载所有省份
   */
  async function loadProvinces() {
    if (provinces.value.length > 0) return // 如果已加载则不重复请求
    loading.value = true
    try {
      const res = await getProvinces()
      //debugger;
      provinces.value = res
    } catch (error) {
      console.error('Failed to load provinces:', error)
    } finally {
      loading.value = false
    }
  }

  /**
   * 根据省份代码加载城市
   * @param {string} provinceCode 
   */
  async function loadCitiesByProvince(provinceCode) {
    if (!provinceCode) {
      cities.value = []
      districts.value = []
      return
    }
    // 可选：检查缓存，如果之前加载过该省的城市，可以直接使用（此处简化为每次重新请求或简单缓存）
    try {
      const res = await getCities(provinceCode)
      cities.value = res
      // 切换省份时清空区县
      districts.value = []
    } catch (error) {
      console.error('Failed to load cities:', error)
    }
  }

  /**
   * 根据城市代码加载区县
   * @param {string} cityCode 
   */
  async function loadDistrictsByCity(cityCode) {
    if (!cityCode) {
      districts.value = []
      return
    }
    try {
      const res = await getDistricts(cityCode)
      districts.value = res
    } catch (error) {
      console.error('Failed to load districts:', error)
    }
  }

  /**
   * 重置所有地区选择
   */
  function resetAreaData() {
    provinces.value = []
    cities.value = []
    districts.value = []
  }

  return {
    provinces,
    cities,
    districts,
    loading,
    loadProvinces,
    loadCitiesByProvince,
    loadDistrictsByCity,
    resetAreaData
  }
})