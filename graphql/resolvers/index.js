const { hashSync } = require('bcryptjs');

const Event = require('../../models/event');
const User = require('../../models/user');
const Booking = require('../../models/booking');

module.exports = {
  events: async () => {
    const events = await Event.find();
    return events.map(event => {
      const eventObj = event.toObject();
      return {...eventObj, date: new Date(eventObj.date).toISOString()};
    });
  },
  bookings: async () => {
    const bookings = await Booking.find();
    return bookings.map(booking => {
      const bookingObj = booking.toObject();
      return {
        ...bookingObj,
        createdAt: new Date(bookingObj.createdAt).toISOString(),
        updatedAt: new Date(bookingObj.updatedAt).toISOString()
      }
    })
  },
  createEvent: async (a) => {
    try {
      const { title, description, price, date } = a.eventInput;
      const event = new Event({
        title,
        description,
        price: +price,
        date: new Date(date),
        creator: '603f19e6924be91c85348d12',
      });
      const savedEvent = await event.save();
      const user = await User.findById('603f19e6924be91c85348d12');
      if (!user) {
        throw new Error('User not found.');
      }
      await user.createdEvents.push(savedEvent);
      await user.save();
      return savedEvent;
    } catch (err) {
      throw new Error('event not created', err);
    }
  },
  createUser: async (a) => {
    const { email, password } = a.userInput;
    const existingUser = await User.findOne({ email });
    if (existingUser) {
      throw new Error('User already exists');
    }
    const user = new User({
      email,
      password: hashSync(password, 10),
    });
    const res = await user.save();
    res.password = null;
    return res;
  },
  bookEvent: async a => {
    const fetchedEvent = await Event.findOne({_id: a.eventId});
    const booking = new Booking({
      user: '603f19e6924be91c85348d12',
      event: fetchedEvent
    });
    const result = await booking.save();
    const resultObj = result.toObject();
    return {
      ...resultObj,
      createdAt: new Date(resultObj.createdAt).toISOString(),
      updatedAt: new Date(resultObj.updatedAt).toISOString()
    }
  },
  cancelBooking: async a => {
    const fetchedBooking = await Booking.findById(a.bookingId);
    await Booking.deleteOne({_id: a.bookingId});    
    return fetchedBooking.event;
  }
};
