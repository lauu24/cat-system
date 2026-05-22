export const formatFecha = (fecha) => {
  if (!fecha) return '—'
  
  const fechaStr = fecha.toString()
  const esSoloFecha = fechaStr.includes('T00:00:00')
  
  const date = new Date(fechaStr)
  
  return date.toLocaleDateString('es-CO', {
    timeZone: esSoloFecha ? 'UTC' : 'America/Bogota',
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
  })
}