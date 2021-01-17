// use the context by adding {models} as the third parameter in each function
module.exports = {
  notes: async (parent, args, { models }) => {
    return await models.Note.find().limit(100);
  },
  note: async (parent, args, { models }) => {
    return await models.Note.findById(args.id);
  },
  user: async (parent, { username }, { models }) => {
    return await models.User.findOne({ username });
  },
  users: async (parent, args, { models }) => {
    return await models.User.find({});
  },
  me: async (parent, args, { models, user }) => {
    return await models.User.findById(user.id);
  },
  noteFeed: async (parent, { cursor }, { models }) => {
    const limit = 10;
    let hasNextPage = false;
    let cursorQuery = {};

    // if there is a curdor
    // our query will look for notes with an ObjectId less than that of the cursor
    if (cursor) {
      cursorQuery = {_id: {$lt: cursor}};
    }
    // find the limit +1 of notes in our db, sorted newest to oldest
    let notes = await models.Note.find(cursorQuery)
      .sort({_id: -1})
      .limit(limit + 1);

    // if the number of notes we find exceeds our limit
    // set hasNextPage to true and trim the notes to the limit
    if (notes.length > limit) {
      hasNextPage = true;
      notes = notes.slice(0, -1)
    }

    // the new cursor will be the Mongo object ID of the last itme in the feed array
    const newCursor = notes[notes.length - 1]._id;
    return {
      notes,
      cursor: newCursor,
      hasNextPage
    }
  }
};
