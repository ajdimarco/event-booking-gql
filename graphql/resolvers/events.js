const Event = require('../../models/event');
const User = require('../../models/user');
const { transformEvent } = require('./merge');

module.exports = {
  events: async () => {
    const events = await Event.find();
    return events.map((event) => transformEvent(event.toObject()));
  },
  createEvent: async (a) => {
    try {
      const { title, description, price, date } = a.eventInput;
      const event = new Event({
        title,
        description,
        price: +price,
        date: new Date(date),
        creator: '603f19e6924be91c85348d12'
      });
      const savedEvent = await event.save();
      const user = await User.findById('603f19e6924be91c85348d12');
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
