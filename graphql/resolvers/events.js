const Event = require('../../models/event');
const User = require('../../models/user');
const { transformEvent } = require('./merge');

module.exports = {
  events: async () => {
    const events = await Event.find();
    return events.map((event) => transformEvent(event.toObject()));
  },
  createEvent: async (a, req) => {
    if (!req.isAuth) {
      throw new Error('Unauthenticated');
    }
    try {
      const { title, description, price, date } = a.eventInput;
      const event = new Event({
        title,
        description,
        price: +price,
        date: new Date(date),
        creator: req.userId
      });
      const savedEvent = await event.save();
      const user = await User.findById(req.userId);
      if (!user) {
        throw new Error('User not found.');
      }
      await user.createdEvents.push(savedEvent);
      await user.save();
      return transformEvent(savedEvent.toObject());
    } catch (err) {
      throw new Error('event not created', err);
    }
  }
};
