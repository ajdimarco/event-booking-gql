const { hashSync } = require('bcryptjs');

const Event = require('../../models/event');
const User = require('../../models/user');

module.exports = {
  events: async () => {
    const events = await Event.find();
    return events.map(event => {
      const eventObj = event.toObject();
      return {...eventObj, date: new Date(eventObj.date).toISOString()};
    });
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
};
