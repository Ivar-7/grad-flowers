import { useCallback, useEffect, useMemo, useState } from 'react'
import { fetchFlowers } from '../api/flowers.api'
import type {
  Flower,
  FlowerCategory,
  FlowerSortOption,
} from '../types/flower.types'
import { AppError } from '@/shared/errors/app-error'
import { normalizeError } from '@/shared/errors/error-normalizer'

export interface UseFlowersOptions {
  initialCategory?: FlowerCategory
  initialColor?: string
}

export function useFlowers(options: UseFlowersOptions = {}) {
  const [remoteFlowers, setRemoteFlowers] = useState<Flower[]>([])
  const [isLoading, setIsLoading] = useState<boolean>(true)
  const [error, setError] = useState<AppError | null>(null)

  const [selectedCategory, setSelectedCategory] = useState<FlowerCategory>(
    options.initialCategory ?? 'all',
  )
  const [selectedColor, setSelectedColor] = useState<string>(
    options.initialColor ?? 'all',
  )
  const [searchQuery, setSearchQuery] = useState<string>('')
  const [sortBy, setSortBy] = useState<FlowerSortOption>('price-asc')

  useEffect(() => {
    let isMounted = true

    fetchFlowers(selectedCategory)
      .then((data) => {
        if (isMounted) {
          setRemoteFlowers(data)
          setIsLoading(false)
        }
      })
      .catch((err) => {
        if (isMounted) {
          setError(
            normalizeError(err, 'Could not retrieve floral arrangements.'),
          )
          setIsLoading(false)
        }
      })

    return () => {
      isMounted = false
    }
  }, [selectedCategory])

  const refetch = useCallback(() => {
    setIsLoading(true)
    setError(null)
    fetchFlowers(selectedCategory)
      .then((data) => {
        setRemoteFlowers(data)
        setIsLoading(false)
      })
      .catch((err) => {
        setError(normalizeError(err, 'Could not retrieve floral arrangements.'))
        setIsLoading(false)
      })
  }, [selectedCategory])

  const filteredFlowers = useMemo(() => {
    let result = [...remoteFlowers]

    if (selectedColor && selectedColor !== 'all') {
      const colorLower = selectedColor.toLowerCase()
      result = result.filter(
        (f) =>
          f.schoolColorTags.some((tag) =>
            tag.toLowerCase().includes(colorLower),
          ) ||
          f.ribbonColors.some((ribbon) =>
            ribbon.toLowerCase().includes(colorLower),
          ),
      )
    }

    if (searchQuery.trim()) {
      const queryLower = searchQuery.toLowerCase().trim()
      result = result.filter(
        (f) =>
          f.name.toLowerCase().includes(queryLower) ||
          f.whatsInIt.toLowerCase().includes(queryLower) ||
          f.description.toLowerCase().includes(queryLower) ||
          f.schoolColorTags.some((tag) =>
            tag.toLowerCase().includes(queryLower),
          ),
      )
    }

    result.sort((a, b) => {
      switch (sortBy) {
        case 'price-desc':
          return b.price - a.price
        case 'name':
          return a.name.localeCompare(b.name)
        case 'featured':
          return (b.isFeatured ? 1 : 0) - (a.isFeatured ? 1 : 0)
        case 'price-asc':
        default:
          return a.price - b.price
      }
    })

    return result
  }, [remoteFlowers, selectedColor, searchQuery, sortBy])

  const isEmpty = !isLoading && !error && filteredFlowers.length === 0
  const isSuccess = !isLoading && !error && filteredFlowers.length > 0

  return {
    flowers: filteredFlowers,
    totalCount: filteredFlowers.length,
    isLoading,
    isSuccess,
    isEmpty,
    error,
    refetch,
    selectedCategory,
    setSelectedCategory,
    selectedColor,
    setSelectedColor,
    searchQuery,
    setSearchQuery,
    sortBy,
    setSortBy,
  }
}
