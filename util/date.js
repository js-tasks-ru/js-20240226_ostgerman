import { capitalizeFirstLetter } from './string.js';

export const getDaysOfWeek = (firstDayOfWeek = 1, localeString = 'ru-RU') => {
  let daysOfWeekMap = new Map();
  const getDaysOfWeekInt = () => {
    const key = `${firstDayOfWeek}_${localeString}`;
    if (daysOfWeekMap.has(key)) {
      return daysOfWeekMap.get(key);
    }
    const daysOfWeek = [];    
    const date = new Date(2020, 1, 1);
    date.setDate(date.getDate() - (date.getDay() - firstDayOfWeek));
    for (let i = 1; i <= 7; i++) {
      daysOfWeek.push(capitalizeFirstLetter(date.toLocaleString(localeString, { weekday: 'short' })));
      date.setDate(date.getDate() + 1);
    }
    daysOfWeekMap.set(key, daysOfWeek);
    return daysOfWeek;
  };
  return getDaysOfWeekInt();
};

export const getFirstDayOfMonthDate = date => {
  return new Date(date.getFullYear(), date.getMonth(), 1);
};

export const getLastDayOfMonthDate = date => {
  return new Date(date.getFullYear(), date.getMonth() + 1, 0);
};

export const getNextMonthDate = date => {
  return new Date(date.getFullYear(), date.getMonth() + 1, 1);
};

export const getMonthName = (date, localeString = 'ru-RU') => {
  return date.toLocaleString(localeString, { month: 'long' });
};

export const compareDates = (date1, date2) => {  
  return date1.getTime() - date2.getTime();
};