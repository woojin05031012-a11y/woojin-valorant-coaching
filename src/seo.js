import { useEffect } from 'react'

// 페이지마다 제목·설명·검색 노출 여부를 정한다.
// noindex: true 이면 검색 결과에 나오지 않게 한다 (관리자, 신청 확인 페이지용).
export const SITE_URL = 'https://woojin-valorant-coaching.vercel.app'

function setMeta(attr, key, content) {
  let el = document.head.querySelector(`meta[${attr}="${key}"]`)
  if (!el) { el = document.createElement('meta'); el.setAttribute(attr, key); document.head.appendChild(el) }
  el.setAttribute('content', content)
}
function setCanonical(href) {
  let el = document.head.querySelector('link[rel="canonical"]')
  if (!el) { el = document.createElement('link'); el.setAttribute('rel', 'canonical'); document.head.appendChild(el) }
  el.setAttribute('href', href)
}

export function usePageMeta({ title, description, path = '/', noindex = false }) {
  useEffect(() => {
    document.title = title
    setMeta('name', 'robots', noindex ? 'noindex, nofollow' : 'index, follow')
    if (description) {
      setMeta('name', 'description', description)
      setMeta('property', 'og:description', description)
    }
    setMeta('property', 'og:title', title)
    setMeta('property', 'og:type', 'website')
    setMeta('property', 'og:locale', 'ko_KR')
    if (!noindex) {
      setMeta('property', 'og:url', SITE_URL + path)
      setCanonical(SITE_URL + path)
    }
  }, [title, description, path, noindex])
}
