const monthNames = [
  'January',
  'February',
  'March',
  'April',
  'May',
  'June',
  'July',
  'August',
  'September',
  'October',
  'November',
  'December'
]

function dateToString(date: Date) {
  const day = date.getDate()
  const month = monthNames[date.getMonth()]
  const year = date.getFullYear()
  const dateString = `${day} ${month}, ${year}`
  return dateString
}

function dateToStringWithTime(date: Date) {
  const month = monthNames[date.getMonth()]
  const day = date.getDate()
  const year = date.getFullYear()
  let hour = date.getHours()
  const minute = date.getMinutes()
  const amOrPm = hour >= 12 ? 'PM' : 'AM'
  hour = hour % 12 || 12
  const formattedHour = hour.toString().padStart(2, '0')
  const formattedDate = `${month} ${day}, ${year} at ${formattedHour}:${minute.toString().padStart(2, '0')} ${amOrPm}`
  return formattedDate
}

export { dateToString, dateToStringWithTime }
