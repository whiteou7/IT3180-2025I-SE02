import { useState, useMemo } from "react"

export interface UsePaginationOptions {
  itemsPerPage?: number
  initialPage?: number
}

export interface UsePaginationReturn<T> {
  currentPage: number
  totalPages: number
  itemsPerPage: number
  paginatedItems: T[]
  totalItems: number
  setCurrentPage: (page: number) => void
  setItemsPerPage: (items: number) => void
  nextPage: () => void
  previousPage: () => void
  canGoNext: boolean
  canGoPrevious: boolean
  startIndex: number
  endIndex: number
}

export function usePagination<T>(
  items: T[],
  options: UsePaginationOptions = {}
): UsePaginationReturn<T> {
  const { itemsPerPage: initialItemsPerPage = 10, initialPage = 1 } = options

  const [currentPage, setCurrentPage] = useState(initialPage)
  const [itemsPerPage, setItemsPerPage] = useState(initialItemsPerPage)

  const totalItems = items.length
  const totalPages = Math.max(1, Math.ceil(totalItems / itemsPerPage))

  // Reset to page 1 if current page is out of bounds
  const safeCurrentPage = useMemo(() => {
    if (currentPage > totalPages) {
      return 1
    }
    return Math.max(1, Math.min(currentPage, totalPages))
  }, [currentPage, totalPages])

  const paginatedItems = useMemo(() => {
    const startIndex = (safeCurrentPage - 1) * itemsPerPage
    const endIndex = startIndex + itemsPerPage
    return items.slice(startIndex, endIndex)
  }, [items, safeCurrentPage, itemsPerPage])

  const startIndex = (safeCurrentPage - 1) * itemsPerPage
  const endIndex = Math.min(startIndex + itemsPerPage, totalItems)

  const canGoNext = safeCurrentPage < totalPages
  const canGoPrevious = safeCurrentPage > 1

  const nextPage = () => {
    if (canGoNext) {
      setCurrentPage(safeCurrentPage + 1)
    }
  }

  const previousPage = () => {
    if (canGoPrevious) {
      setCurrentPage(safeCurrentPage - 1)
    }
  }

  const handleSetItemsPerPage = (newItemsPerPage: number) => {
    setItemsPerPage(newItemsPerPage)
    // Recalculate current page to stay within bounds
    const newTotalPages = Math.max(1, Math.ceil(totalItems / newItemsPerPage))
    if (safeCurrentPage > newTotalPages) {
      setCurrentPage(1)
    }
  }

  return {
    currentPage: safeCurrentPage,
    totalPages,
    itemsPerPage,
    paginatedItems,
    totalItems,
    setCurrentPage,
    setItemsPerPage: handleSetItemsPerPage,
    nextPage,
    previousPage,
    canGoNext,
    canGoPrevious,
    startIndex: startIndex + 1, // 1-based for display
    endIndex,
  }
}
