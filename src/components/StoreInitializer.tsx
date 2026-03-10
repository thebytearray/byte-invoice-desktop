import { useEffect } from 'react'
import { useStore } from '@/lib/store'

export function StoreInitializer() {
  const initializeData = useStore((s) => s.initializeData)

  useEffect(() => {
    initializeData()
  }, [initializeData])

  return null
}
