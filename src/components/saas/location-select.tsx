import { NativeSelect } from '@chakra-ui/react'
import { COUNTRIES, US_STATES } from '@/constants/locations'

interface LocationSelectProps {
  type: 'country' | 'state'
  value: string
  onChange: (value: string) => void
  country?: string
  placeholder?: string
  invalid?: boolean
}

export function CountryCombobox({
  value,
  onChange,
  placeholder = 'Select country...',
  invalid,
}: Omit<LocationSelectProps, 'type' | 'country'>) {
  return (
    <NativeSelect.Root invalid={invalid}>
      <NativeSelect.Field
        value={value}
        onChange={(e: React.ChangeEvent<HTMLSelectElement>) => onChange(e.target.value)}
        placeholder={placeholder}
      >
        {COUNTRIES.map((item) => (
          <option key={item.value} value={item.value}>
            {item.label}
          </option>
        ))}
      </NativeSelect.Field>
      <NativeSelect.Indicator />
    </NativeSelect.Root>
  )
}

export function StateCombobox({
  value,
  onChange,
  placeholder = 'Select state or province...',
  invalid,
}: Omit<LocationSelectProps, 'type' | 'country'>) {
  return (
    <NativeSelect.Root invalid={invalid}>
      <NativeSelect.Field
        value={value}
        onChange={(e: React.ChangeEvent<HTMLSelectElement>) => onChange(e.target.value)}
        placeholder={placeholder}
      >
        {US_STATES.map((item) => (
          <option key={item.value} value={item.value}>
            {item.label}
          </option>
        ))}
      </NativeSelect.Field>
      <NativeSelect.Indicator />
    </NativeSelect.Root>
  )
}
