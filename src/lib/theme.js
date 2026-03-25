export function getTheme() {
  return localStorage.getItem('trn-theme') || 'dark'
}

export function setTheme(theme) {
  localStorage.setItem('trn-theme', theme)
  if (theme === 'light') {
    document.documentElement.classList.add('light')
  } else {
    document.documentElement.classList.remove('light')
  }
}

export function initTheme() {
  setTheme(getTheme())
}
