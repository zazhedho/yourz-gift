const occasionLabels = {
  baby_shower: 'Baby shower',
  birthday: 'Birthday',
  custom: 'Gift list',
  holiday: 'Holiday',
  housewarming: 'Housewarming',
  wedding: 'Wedding',
}

export const formatOccasion = (occasion) => {
  const value = String(occasion || 'custom').trim()
  if (occasionLabels[value]) return occasionLabels[value]
  return value
    .split(/[_\s-]+/)
    .filter(Boolean)
    .map((word) => word.charAt(0).toUpperCase() + word.slice(1).toLowerCase())
    .join(' ')
}
