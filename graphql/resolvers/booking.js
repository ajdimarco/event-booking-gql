const Booking = require('../../models/booking');
const Event = require('../../models/event');
const { transformEvent, transformBooking } = require('./merge');

module.exports = {
  bookings: async (a, req) => {
    if (!req.isAuth) {
      throw new Error('Unauthenticated');
    }
    const bookings = await Booking.find();
    return bookings.map((booking) => transformBooking(booking.toObject()));
  },
  bookEvent: async (a, req) => {
    if (!req.isAuth) {
      throw new Error('Unauthenticated');
    }
    const fetchedEvent = await Event.findOne({ _id: a.eventId });
    const booking = new Booking({
      user: req.userId,
      event: fetchedEvent
    });
    const result = await booking.save();
    return transformBooking(result.toObject());
  },
  cancelBooking: async (a, req) => {
    if (!req.isAuth) {
      throw new Error('Unauthenticated');
    }
    const fetchedBooking = await Booking.findById(a.bookingId);
    await Booking.deleteOne({ _id: a.bookingId });
    return transformEvent(fetchedBooking.toObject().event);
  }
};