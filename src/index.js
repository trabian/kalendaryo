import { Component } from 'react'
import pt from 'prop-types'
import {
  format,
  addMonths,
  subMonths,
  isDate,
  getDate,
  isEqual as isEqualDates,
  startOfMonth,
  endOfMonth,
  eachDayOfInterval,
  addWeeks,
  startOfWeek,
  endOfWeek,
  isSameMonth
} from 'date-fns'

const dateToDayObjects = dateValue => ({
  dateValue,
  label: getDate(dateValue)
})

const getState = props => {
  const {startCurrentDateAt, startSelectedDateAt} = props
  return {
    date: isDate(startCurrentDateAt) ? startCurrentDateAt : new Date(),
    selectedDate: isDate(startSelectedDateAt) ? startSelectedDateAt : new Date()
  }
}

class Kalendaryo extends Component {
  state = getState(this.props)

  static defaultProps = {
    startWeekAt: 0,
    startCurrentDateAt: new Date(),
    startSelectedDateAt: new Date(),
    defaultFormat: 'MM/DD/YY'
  }

  static propTypes = {
    render: pt.func.isRequired,
    onChange: pt.func,
    onDateChange: pt.func,
    onSelectedChange: pt.func,
    startWeekAt: pt.number,
    defaultFormat: pt.string,
    startCurrentDateAt: pt.any
  }

  getFormattedDate = (arg = this.state.date, dateFormat) => {
    if (isDate(arg) && dateFormat === undefined) {
      return format(arg, this.props.defaultFormat)
    }

    if (typeof arg === 'string' && dateFormat === undefined) {
      return format(this.state.date, arg)
    }

    if (isDate(arg) && typeof dateFormat === 'string') {
      return format(arg, dateFormat)
    }

    throw new Error('Invalid arguments passed')
  }

  getDateNextMonth = (arg = this.state.date, amount) => {
    if (isDate(arg) && amount === undefined) {
      return addMonths(arg, 1)
    }

    if (Number.isInteger(arg) && amount === undefined) {
      return addMonths(this.state.date, arg)
    }

    if (isDate(arg) && Number.isInteger(amount)) {
      return addMonths(arg, amount)
    }

    throw new Error('Invalid arguments passed')
  }

  getDatePrevMonth = (arg = this.state.date, amount) => {
    if (isDate(arg) && amount === undefined) {
      return subMonths(arg, 1)
    }

    if (Number.isInteger(arg) && amount === undefined) {
      return subMonths(this.state.date, arg)
    }

    if (isDate(arg) && Number.isInteger(amount)) {
      return subMonths(arg, amount)
    }

    throw new Error('Invalid arguments passed')
  }

  getDaysInMonth = (date = this.state.date) => {
    if (!isDate(date)) throw new Error('Value is not an instance of Date')
    return eachDayOfInterval({
      start: startOfMonth(date),
      end: endOfMonth(date)
    }).map(dateToDayObjects)
  }

  getWeeksInMonth = (date = this.state.date, weekStartsOn = this.props.startWeekAt) => {
    if (!isDate(date)) {
      throw new Error(`First argument must be a date`)
    }

    if (!Number.isInteger(weekStartsOn)) {
      throw new Error('Second argument must be an integer')
    }

    const weekOptions = { weekStartsOn }
    const firstDayOfMonth = startOfMonth(date)
    const firstDayOfFirstWeek = startOfWeek(firstDayOfMonth, weekOptions)
    const lastDayOfFirstWeek = endOfWeek(firstDayOfMonth, weekOptions)

    const getWeeks = (startDay, endDay, weekArray = []) => {
      const week = eachDayOfInterval({ start: startDay, end: endDay }).map(
        dateToDayObjects
      )
      const weeks = [...weekArray, week]
      const nextWeek = addWeeks(startDay, 1)

      const firstDayNextWeek = startOfWeek(nextWeek, weekOptions)
      const lastDayNextWeek = endOfWeek(nextWeek, weekOptions)

      if (isSameMonth(firstDayNextWeek, date)) {
        return getWeeks(firstDayNextWeek, lastDayNextWeek, weeks)
      }

      return weeks
    }

    return getWeeks(firstDayOfFirstWeek, lastDayOfFirstWeek)
  }

  setDate = date => {
    if (!isDate(date)) throw new Error('Value is not an instance of Date')
    this.setState({ date })
  }

  setSelectedDate = selectedDate => {
    if (!isDate(selectedDate)) throw new Error('Value is not an instance of Date')
    this.setState({ selectedDate })
  }

  pickDate = date => {
    if (!isDate(date)) throw new Error('Value is not an instance of Date')
    this.setState({ date, selectedDate: date })
  }

  componentDidUpdate (_, prevState) {
    const { onChange, onDateChange, onSelectedChange } = this.props

    const dateChanged = !isEqualDates(prevState.date, this.state.date)
    const selectedDateChanged = !isEqualDates(prevState.selectedDate, this.state.selectedDate)
    const stateUpdated = dateChanged || selectedDateChanged

    if (dateChanged && onDateChange) {
      onDateChange(this.state.date)
    }

    if (selectedDateChanged && onSelectedChange) {
      onSelectedChange(this.state.selectedDate)
    }

    if (stateUpdated && onChange) {
      onChange(this.state)
    }
  }

  render () {
    const {
      state,
      props,
      getFormattedDate,
      getDateNextMonth,
      getDatePrevMonth,
      getDaysInMonth,
      getWeeksInMonth,
      setDate,
      setSelectedDate,
      pickDate
    } = this

    const {
      startCurrentDateAt,
      defaultFormat,
      onChange,
      onDateChange,
      onSelectedChange,
      render,
      ...rest
    } = props

    return render({
      ...rest,
      ...state,
      getFormattedDate,
      getDateNextMonth,
      getDatePrevMonth,
      getDaysInMonth,
      getWeeksInMonth,
      setDate,
      setSelectedDate,
      pickDate
    })
  }
}

export default Kalendaryo
