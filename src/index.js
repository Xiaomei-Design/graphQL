// index.js
// This is the main entry point of our application
const express = require('express');
const { ApolloServer } = require('apollo-server-express');
const jwt = require('jsonwebtoken');
require('dotenv').config();

// local module imports
const db = require('./db');
const models = require('./models');
const typeDefs = require('./schema');
const resolvers = require('./resolvers');

const port = process.env.PORT || 4000;
const DB_HOST = process.env.DB_HOST;

const app = express();
db.connect(DB_HOST);

const getUser = token => {
  if (token) {
    try {
      return jwt.verify(token, process.env.JWT_SECRET);
    } catch (err) {
      throw new Error('Session invalid');
    }
  }
};

// Apollo Server setup
const server = new ApolloServer({
    typeDefs,
    resolvers,
    context: ({ req }) => {
        // get the user token from the headers
      const token = req.headers.authorization
      // try to retrieve a user with the token
      const user = getUser(token)
      console.log(user);
      // Add the db models to the context
      return { models, user };
    }
  });

// Apply the Apollo GraphQl middleware and set the path to /api
server.applyMiddleware({
  app,
  path: '/api'
});

app.listen({port}, () =>
  console.log(
    `GraphQL Server running at http://localhost:${port}${server.graphqlPath}`
  )
);
