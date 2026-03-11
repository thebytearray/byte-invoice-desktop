import type { ReactNode } from 'react'
import { useMemo } from 'react'
import { Country, State, City } from 'country-state-city'
import {
  Select,
  createListCollection,
} from '@chakra-ui/react'

type CollectionItem = { label: string; value: string }

export interface LocationSelectGroupProps {
  country: string
  state: string
  city: string
  onCountryChange: (value: string) => void
  onStateChange: (value: string) => void
  onCityChange: (value: string) => void
  countryInvalid?: boolean
  stateInvalid?: boolean
  cityInvalid?: boolean
  countryPlaceholder?: string
  statePlaceholder?: string
  cityPlaceholder?: string
  children?: (props: {
    countrySelect: ReactNode
    stateSelect: ReactNode
    citySelect: ReactNode
  }) => ReactNode
}

const selectPositioning = { strategy: 'fixed' as const, hideWhenDetached: true }

function LocationSelectDropdown({
  collection,
  value,
  onValueChange,
  name,
  placeholder,
  disabled,
  invalid,
}: {
  collection: ReturnType<typeof createListCollection<CollectionItem>>
  value: string
  onValueChange: (details: { value: string[] }) => void
  name: string
  placeholder: string
  disabled?: boolean
  invalid?: boolean
}) {
  return (
    <Select.Root
      collection={collection}
      value={value ? [value] : []}
      onValueChange={(details) => onValueChange(details)}
      disabled={disabled}
      invalid={invalid}
      positioning={selectPositioning}
      name={name}
    >
      <Select.HiddenSelect />
      <Select.Control>
        <Select.Trigger>
          <Select.ValueText placeholder={placeholder} />
        </Select.Trigger>
        <Select.IndicatorGroup>
          <Select.Indicator />
        </Select.IndicatorGroup>
      </Select.Control>
      <Select.Positioner>
        <Select.Content>
          {collection.items.map((item: CollectionItem) => (
            <Select.Item key={item.value} item={item}>
              <Select.ItemText>{item.label}</Select.ItemText>
            </Select.Item>
          ))}
        </Select.Content>
      </Select.Positioner>
    </Select.Root>
  )
}

export function LocationSelectGroup({
  country,
  state,
  city,
  onCountryChange,
  onStateChange,
  onCityChange,
  countryInvalid,
  stateInvalid,
  cityInvalid,
  countryPlaceholder = 'Select country...',
  statePlaceholder = 'Select state or province...',
  cityPlaceholder = 'Select city...',
  children,
}: LocationSelectGroupProps) {
  const countryCollection = useMemo(() => {
    const countries = Country.getAllCountries()
    return createListCollection({
      items: countries.map((c) => ({ label: c.name, value: c.name })),
    })
  }, [])

  const selectedCountry = useMemo(() => {
    if (!country) return null
    return Country.getAllCountries().find((c) => c.name === country) ?? null
  }, [country])

  const stateCollection = useMemo((): ReturnType<typeof createListCollection<CollectionItem>> => {
    if (!selectedCountry) return createListCollection<CollectionItem>({ items: [] })
    const states = State.getStatesOfCountry(selectedCountry.isoCode)
    return createListCollection({
      items: states.map((s) => ({ label: s.name, value: s.name })),
    })
  }, [selectedCountry])

  const selectedState = useMemo(() => {
    if (!selectedCountry || !state) return null
    const states = State.getStatesOfCountry(selectedCountry.isoCode)
    return states.find((s) => s.name === state) ?? null
  }, [selectedCountry, state])

  const cityCollection = useMemo((): ReturnType<typeof createListCollection<CollectionItem>> => {
    if (!selectedCountry) return createListCollection<CollectionItem>({ items: [] })
    if (selectedState) {
      const cities = City.getCitiesOfState(selectedCountry.isoCode, selectedState.isoCode)
      if (cities.length > 0) {
        return createListCollection({
          items: cities.map((c) => ({ label: c.name, value: c.name })),
        })
      }
    }
    const citiesOfCountry = City.getCitiesOfCountry(selectedCountry.isoCode)
    if (citiesOfCountry && citiesOfCountry.length > 0) {
      return createListCollection({
        items: citiesOfCountry.map((c) => ({ label: c.name, value: c.name })),
      })
    }
    return createListCollection<CollectionItem>({ items: [] })
  }, [selectedCountry, selectedState])

  const countrySelect = (
    <LocationSelectDropdown
      collection={countryCollection}
      value={country}
      onValueChange={(d) => onCountryChange(d.value[0] ?? '')}
      name="country"
      placeholder={countryPlaceholder}
      invalid={countryInvalid}
    />
  )
  const stateSelect = (
    <LocationSelectDropdown
      collection={stateCollection}
      value={state}
      onValueChange={(d) => onStateChange(d.value[0] ?? '')}
      name="state"
      placeholder={statePlaceholder}
      disabled={!country}
      invalid={stateInvalid}
    />
  )
  const cityDisabled = !country || (stateCollection.items.length > 0 && !state)

  const citySelect = (
    <LocationSelectDropdown
      collection={cityCollection}
      value={city}
      onValueChange={(d) => onCityChange(d.value[0] ?? '')}
      name="city"
      placeholder={cityPlaceholder}
      disabled={cityDisabled}
      invalid={cityInvalid}
    />
  )

  if (children) {
    return <>{children({ countrySelect, stateSelect, citySelect })}</>
  }

  return (
    <>
      {countrySelect}
      {stateSelect}
      {citySelect}
    </>
  )
}
