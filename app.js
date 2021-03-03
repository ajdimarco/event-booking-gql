const express = require('express');
const bodyParser = require('body-parser');
const { graphqlHTTP } = require('express-graphql');
const { buildSchema } = require('graphql');
const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

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
      createEvent: ({ eventInput }) => {
        const event = new Event({
          title: eventInput.title,
          description: eventInput.description,
          price: +eventInput.price,
          date: new Date(eventInput.date),
          creator: '603f0e6e5d79831735dfa1f5'
        });
        let createdEvent;
        return event
          .save()
          .then((result) => {
            createdEvent = result;
            return User.findById('603f0e6e5d79831735dfa1f5');
          })
          .then(user => {
            if (!user) {
              throw new Error('User not found.');
            }
            user.createdEvents.push(event);
            return user.save();
          })
          .then(result => {
            return createdEvent;
          })
          .catch((err) => {
            console.log(err);
            throw err;
          });
      },
      createUser: ({ userInput }) => {
        return User.findOne({ email: userInput.email })
          .then((user) => {
            if (user) {
              throw new Error('User exists already.');
            }
            return bcrypt.hash(userInput.password, 12);
          })
          .then((hashedPassword) => {
            const user = new User({
              email: userInput.email,
              password: hashedPassword,
            });
            return user.save();
          })
          .then((result) => {
            console.log(result);
            result.password = null;
            return result;
          })
          .catch((err) => {
            throw err;
          });
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
