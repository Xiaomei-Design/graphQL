const mongoose = require('mongoose');

const Userschema = new mongoose.Schema(
  {
    username: {
      type: String,
      required: true,
      index: { unique: true }
    },
    email: {
      type: String,
      required: true,
      index: { unique: true }
    },
    password: {
      type: String,
      required: true,
    },
    avatar: {
      type: String
    },
  },

  {
    timestamps: true
  }
);

const User = mongoose.model('User', Userschema);
module.exports = User