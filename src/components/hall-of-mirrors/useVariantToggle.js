import { useState } from 'react'

export function useVariantToggle(variantKeys, defaultSelected) {
  const [variantImages, setVariantImages] = useState({})
  const [animationsEnabled, setAnimationsEnabled] = useState(false)
  const [scale, setScale] = useState(25)
  const [baseFrequency, setBaseFrequency] = useState(0.01)
  const [numOctaves, setNumOctaves] = useState(2)

  const [variantEnabled, setVariantEnabled] = useState(
    Object.fromEntries(variantKeys.map(key => [key, false]))
  )

  const [selectedVariant, setSelectedVariant] = useState(defaultSelected)

  const handleToggleEnabled = (variantId) => {
    setVariantEnabled(prev => ({
      ...prev,
      [variantId]: !prev[variantId]
    }))
  }

  const handleToggleSelect = (variantId) => {
    if (selectedVariant === variantId) {
      setSelectedVariant(null)
    } else {
      setSelectedVariant(variantId)
    }
  }

  const handleImageUpload = (variantId) => (e) => {
    const file = e.target.files?.[0]
    if (file && file.type.startsWith('image/')) {
      const reader = new FileReader()
      reader.onload = (event) => {
        setVariantImages(prev => ({
          ...prev,
          [variantId]: event.target.result
        }))
      }
      reader.readAsDataURL(file)
    }
  }

  return {
    variantImages, setVariantImages,
    animationsEnabled, setAnimationsEnabled,
    scale, setScale,
    baseFrequency, setBaseFrequency,
    numOctaves, setNumOctaves,
    variantEnabled,
    selectedVariant,
    handleToggleEnabled,
    handleToggleSelect,
    handleImageUpload
  }
}
