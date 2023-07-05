import { useRouter } from 'next/router'
import { useCallback } from 'react'

const useUpdateRouterQuery = () => {
  const router = useRouter()
  const updateRouterQuery = useCallback((queryKey: string, newValue: string) => {
    router.query[queryKey] = newValue;
    router.push(router, undefined, {shallow: true})
  }, [router])

  return updateRouterQuery;
}

export default useUpdateRouterQuery;
