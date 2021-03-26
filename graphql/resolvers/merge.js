const { dateToString } = require('../../helper/date');

const transformEvent = (eventObj) => ({
  ...eventObj,
  date: dateToString(eventObj.date)
});

const transformBooking = (bookingObj) => ({
  ...bookingObj,
  createdAt: dateToString(bookingObj.createdAt),
  updatedAt: dateToString(bookingObj.updatedAt)
});

exports.transformEvent = transformEvent;
exports.transformBooking = transformBooking;

