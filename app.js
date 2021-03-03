const express = require('express');
const bodyParser = require('body-parser');
const { graphqlHTTP } = require('express-graphql');
const { buildSchema } = require('graphql');
const mongoose = require('mongoose');
const { hashSync } = require('bcryptjs');

const Event = require('./models/event');
const User = require('./models/user');

const app = express();

app.use(bodyParser.json());

app.use(
  '/graphql',
  graphqlHTTP({
    schema: buildSchema(`
      type Event {
        _id: ID!
        title: String!
        description: String!
        price: Float!
        date: String!
      }

      type User {
        _id: ID!
        email: String!
        password: String
      }

      input EventInput {
        title: String!
        description: String!
        price: Float!
        date: String!
      }

      input UserInput {
        email: String!
        password: String!
      }

      type RootQuery {
        events: [Event!]!
      }

      type RootMutation {
        createEvent(eventInput: EventInput): Event
        createUser(userInput: UserInput): User
      }

      schema {
        query: RootQuery
        mutation: RootMutation
      }
    `),
    rootValue: {
      events: () => {
        return Event.find()
          .then((events) => {
            return events;
          })
          .catch((err) => {
            throw err;
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
    },
    graphiql: true,
  })
);

mongoose
  .connect(
    `mongodb+srv://${process.env.MONGO_USER}:${process.env.MONGO_PASSWORD}@cluster0.11gxn.mongodb.net/${process.env.MONGO_DB}?retryWrites=true&w=majority`
  )
  .then(() => {
    app.listen(3000);
  })
  .catch(console.log);
