import { useState, useCallback } from 'react'
import { Autocomplete, TextField, InputAdornment } from '@mui/material'
import SearchRoundedIcon from '@mui/icons-material/SearchRounded'
import type { SxProps, Theme } from '@mui/material/styles'

interface GlobalSearchFieldProps {
  value: string
  onChange: (value: string) => void
  onSearch?: () => void
  placeholder?: string
  localStorageKey: string
  maxHistoryItems?: number
  showSearchIcon?: boolean
  sx?: SxProps<Theme>
  size?: 'small' | 'medium'
  inputRef?: React.Ref<HTMLInputElement>
}

const GlobalSearchField = ({
  value,
  onChange,
  onSearch,
  placeholder = 'Global search...',
  localStorageKey,
  maxHistoryItems = 10,
  showSearchIcon = false,
  sx,
  size = 'small',
  inputRef,
}: GlobalSearchFieldProps) => {
  // Search history management
  const [searchHistory, setSearchHistory] = useState<string[]>(() => {
    try {
      const stored = localStorage.getItem(localStorageKey)
      return stored ? JSON.parse(stored) : []
    } catch {
      return []
    }
  })

  const addToSearchHistory = useCallback((searchTerm: string) => {
    const trimmed = searchTerm.trim()
    if (!trimmed) return

    setSearchHistory(prev => {
      const filtered = prev.filter(item => item !== trimmed)
      const updated = [trimmed, ...filtered].slice(0, maxHistoryItems)

      try {
        localStorage.setItem(localStorageKey, JSON.stringify(updated))
      } catch {
        // Ignore localStorage errors
      }

      return updated
    })
  }, [localStorageKey, maxHistoryItems])

  // Handle Enter key
  const handleKeyDown = useCallback((event: React.KeyboardEvent) => {
    if (event.key === 'Enter') {
      event.preventDefault()
      const trimmed = value.trim()
      if (trimmed) {
        addToSearchHistory(trimmed)
        onSearch?.()
      }
    }
  }, [value, addToSearchHistory, onSearch])

  return (
    <Autocomplete
      freeSolo
      options={searchHistory}
      value={value}
      onInputChange={(_, newValue) => onChange(newValue)}
      renderInput={(params) => (
        <TextField
          {...params}
          size={size}
          placeholder={placeholder}
          onKeyDown={handleKeyDown}
          inputRef={inputRef}
          InputProps={{
            ...params.InputProps,
            ...(showSearchIcon && {
              startAdornment: (
                <>
                  <InputAdornment position="start">
                    <SearchRoundedIcon sx={{ color: 'text.secondary', fontSize: 20 }} />
                  </InputAdornment>
                  {params.InputProps.startAdornment}
                </>
              ),
            }),
          }}
        />
      )}
      sx={sx}
    />
  )
}

export default GlobalSearchField
