const models = require("../models")

// use the context by adding {models} as the third parameter in each function
module.exports = {
    notes: async (parent, args, {models}) => {
        return await models.Note.find()
    },
    note: async (parent, args, {models}) => {
        return await models.Note.findById(args.id);
    }
}