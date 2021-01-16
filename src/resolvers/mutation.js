const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const {
  AuthenticationError,
  ForbiddenError
} = require('apollo-server-express');
require('dotenv').config();
const gravatar = require('../util/gravatar');
const mongoose = require('mongoose');

module.exports = {
  newNote: async (parent, args, { models, user }) => {
    // if there is no user on the context, throw an authentication error
    if (!user) {
      throw new AuthenticationError('You must be signed in to create a note');
    }
    return await models.Note.create({
      content: args.content,
      author: mongoose.Types.ObjectId(user.id),
      favoriteCount: 0
    });
  },

  deleteNote: async (parent, { id }, { models, user }) => {
    if (!user) {
      throw new AuthenticationError('You must be signed in to delete a note');
    }
    // find the note
    const note = await models.Note.findById(id);
    // if the note owner and current user don't match, throw a forbidden error
    if (note && String(note.author) !== user.id) {
      throw new ForbiddenError("You don't have permissions to delte the note");
    }
    try {
      // if everything checks out, remove the note
      await note.remove();
      // await models.Note.findOneAndRemove({ _id: id });
      return true;
    } catch (err) {
      return false;
    }
  },

  updateNote: async (parent, { content, id }, { models, user }) => {
    if (!user) {
      throw new AuthenticationError('You must be signed in to update a note');
    }
    // find the note
    const note = await models.Note.findById(id);
    if (note && String(note.author) !== user.id) {
      throw new ForbiddenError("You don't have permissions to update the note");
    }
    return await models.Note.findOneAndUpdate(
      { _id: id },
      { $set: { content } },
      { new: true }
    );
  },

  signUp: async (parent, { username, email, password }, { models }) => {
    email = email.trim().toLowerCase();
    const hashed = await bcrypt.hash(password, 10);
    const avatar = gravatar(email);
    try {
      const user = await models.User.create({
        username,
        email,
        avatar,
        password: hashed
      });
      return jwt.sign({ id: user._id }, process.env.JWT_SECRET);
    } catch (err) {
      console.log(err);
      throw new Error('Error creating account');
    }
  },

  signIn: async (parent, { username, email, password }, { models }) => {
    if (email) {
      email = email.trim().toLowerCase();
    }
    const user = await models.User.findOne({
      $or: [{ email }, { username }]
    });

    if (!user) {
      throw new AuthenticationError('Error signing in');
    }
    const valid = await bcrypt.compare(password, user.password);
    if (!valid) {
      throw new AuthenticationError('Error signing in');
    }
    return jwt.sign({ id: user._id }, process.env.JWT_SECRET);
  },

  toggleFavorite: async (parent, {id}, {models, user}) => {
    if (!user) {
      throw new AuthenticationError()
    }
    // check to see if the user has already favorited the note
    let noteCheck = await models.Note.findById(id);
    const hasUser = noteCheck.favoritedBy.indexOf(user.id)
    // if the user exists in the list
    // pull them from the list and reduce the favoriteCount by 1
    if (hasUser >= 0) {
      return await models.Note.findByIdAndUpdate(
        id,
        {
          $pull: {
            favoritedBy: mongoose.Types.ObjectId(user.id)
          },
          $inc: {
            favoriteCount: -1
          }
        },
        // set new to true to return the updated doc
        {new: true}
      );
    } else {
      // if the user doesnt exist in the list
      // add them to the list and increment the favoriteCount by 1
      return await models.Note.findByIdAndUpdate(
        id,
        {
          $push: {
            favoritedBy: mongoose.Types.ObjectId(user.id)
          },
          $inc: {
            favoriteCount: 1
          }
        },
        {new: true}
      )
    }
  }
};
