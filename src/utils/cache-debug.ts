import { cacheUtils } from '../services/api'

// Development cache debugging utilities
export const cacheDebug = {
  // Log cache status to console
  logStatus: () => {
    console.group('🗄️ API Cache Status')
    console.log(`Cache size: ${cacheUtils.size()} entries`)
    console.groupEnd()
  },

  // Clear all cache and log
  clearAll: () => {
    const sizeBefore = cacheUtils.size()
    cacheUtils.clear()
    console.log(`🧹 Cleared ${sizeBefore} cache entries`)
  },

  // Invalidate petitions cache
  invalidatePetitions: () => {
    cacheUtils.invalidatePattern('GET:/api/petitions')
    cacheUtils.invalidatePattern('GET:/api/petition/')
    console.log('🔄 Invalidated petition caches')
  },

  // Invalidate categories cache
  invalidateCategories: () => {
    cacheUtils.invalidatePattern('GET:/api/categories')
    console.log('🔄 Invalidated categories cache')
  },
}

// Make cache debugging available in development
if (import.meta.env.DEV) {
  // @ts-expect-error - Adding to window for debugging
  window.cacheDebug = cacheDebug
  console.log('🛠️ Cache debugging available via window.cacheDebug')
}
