import type { ReactNode } from 'react'
import { useEffect, useMemo } from 'react'
import { Country, State, City } from 'country-state-city'
import {
  Combobox,
  createListCollection,
  useFilter,
  useListCollection,
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

const comboboxPositioning = { strategy: 'fixed' as const, hideWhenDetached: true }

function LocationCombobox({
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
    <Combobox.Root
      collection={collection}
      value={value ? [value] : []}
      onValueChange={(details) => onValueChange(details)}
      disabled={disabled}
      invalid={invalid}
      positioning={comboboxPositioning}
      name={name}
      placeholder={placeholder}
      allowCustomValue
      openOnClick
      closeOnSelect
    >
      <Combobox.Control>
        <Combobox.Input />
        <Combobox.IndicatorGroup>
          <Combobox.ClearTrigger />
          <Combobox.Trigger />
        </Combobox.IndicatorGroup>
      </Combobox.Control>
      <Combobox.Positioner>
        <Combobox.Content>
          <Combobox.Empty>No matches</Combobox.Empty>
          <Combobox.List>
            {collection.items.map((item: CollectionItem) => (
              <Combobox.Item key={item.value} item={item}>
                <Combobox.ItemText>{item.label}</Combobox.ItemText>
              </Combobox.Item>
            ))}
          </Combobox.List>
        </Combobox.Content>
      </Combobox.Positioner>
    </Combobox.Root>
  )
}

function useLocationCollection(
  predefinedItems: CollectionItem[],
  currentValue: string,
  contains: (value: string, query: string) => boolean
) {
  const itemsWithCustom = useMemo(() => {
    const hasCustom =
      currentValue &&
      !predefinedItems.some(
        (i) => i.value.toLowerCase() === currentValue.toLowerCase()
      )
    if (hasCustom) {
      return [{ label: currentValue, value: currentValue }, ...predefinedItems]
    }
    return predefinedItems
  }, [predefinedItems, currentValue])

  const { collection, set } = useListCollection({
    initialItems: itemsWithCustom,
    filter: (value, query) =>
      contains(value, query) ||
      value.toLowerCase().includes(query.toLowerCase()),
    limit: 100,
  })

  useEffect(() => {
    set(itemsWithCustom)
  }, [itemsWithCustom, set])

  return collection
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
  const countryItems = useMemo(() => {
    const countries = Country.getAllCountries()
    return countries.map((c) => ({ label: c.name, value: c.name }))
  }, [])

  const selectedCountry = useMemo(() => {
    if (!country) return null
    return Country.getAllCountries().find((c) => c.name === country) ?? null
  }, [country])

  const stateItems = useMemo((): CollectionItem[] => {
    if (!selectedCountry) return []
    const states = State.getStatesOfCountry(selectedCountry.isoCode)
    return states.map((s) => ({ label: s.name, value: s.name }))
  }, [selectedCountry])

  const selectedState = useMemo(() => {
    if (!selectedCountry || !state) return null
    const states = State.getStatesOfCountry(selectedCountry.isoCode)
    return states.find((s) => s.name === state) ?? null
  }, [selectedCountry, state])

  const cityItems = useMemo((): CollectionItem[] => {
    if (!selectedCountry) return []
    if (selectedState) {
      const cities = City.getCitiesOfState(
        selectedCountry.isoCode,
        selectedState.isoCode
      )
      if (cities.length > 0) {
        return cities.map((c) => ({ label: c.name, value: c.name }))
      }
    }
    const citiesOfCountry = City.getCitiesOfCountry(selectedCountry.isoCode)
    if (citiesOfCountry && citiesOfCountry.length > 0) {
      return citiesOfCountry.map((c) => ({ label: c.name, value: c.name }))
    }
    return []
  }, [selectedCountry, selectedState])

  const { contains } = useFilter({ sensitivity: 'base' })

  const countryCollection = useLocationCollection(
    countryItems,
    country,
    (value, q) => contains(value, q)
  )

  const stateCollection = useLocationCollection(
    stateItems,
    state,
    (value, q) => contains(value, q)
  )

  const cityCollection = useLocationCollection(
    cityItems,
    city,
    (value, q) => contains(value, q)
  )

  const stateDisabled = !country
  const cityDisabled =
    !country || (stateItems.length > 0 && !state)

  const countrySelect = (
    <LocationCombobox
      collection={countryCollection}
      value={country}
      onValueChange={(d) => {
        const v = d.value[0] ?? ''
        onCountryChange(v)
        if (v !== country) {
          onStateChange('')
          onCityChange('')
        }
      }}
      name="country"
      placeholder={countryPlaceholder}
      invalid={countryInvalid}
    />
  )
  const stateSelect = (
    <LocationCombobox
      collection={stateCollection}
      value={state}
      onValueChange={(d) => {
        const v = d.value[0] ?? ''
        onStateChange(v)
        if (v !== state) onCityChange('')
      }}
      name="state"
      placeholder={statePlaceholder}
      disabled={stateDisabled}
      invalid={stateInvalid}
    />
  )
  const citySelect = (
    <LocationCombobox
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
