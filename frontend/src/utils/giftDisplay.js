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

export const isGiftListCurrent = (list, now = new Date()) => {
  if (!list?.is_active) return false
  if (list.never_expires !== false) return true
  if (!list.expires_at) return false

  return new Date(list.expires_at).getTime() > now.getTime()
}
