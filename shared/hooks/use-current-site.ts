import { useState } from 'react'

type CurrentSiteState = {
  currentSite: string
  setCurrentSite: React.Dispatch<React.SetStateAction<string>>
}

function getInitialSite() {
  if (typeof window === 'undefined') return ''

  const params = new URLSearchParams(window.location.search)

  return params.get('siteId') || params.get('site') || ''
}

export function useCurrentSite(): CurrentSiteState {
  const [currentSite, setCurrentSite] = useState(getInitialSite)

  return {
    currentSite,
    setCurrentSite
  }
}
