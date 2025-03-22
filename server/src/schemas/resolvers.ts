import  User  from '../models/User.js'; // Import Mongoose User model
import { signToken } from '../services/auth.js'; // Import signToken function
import { AuthenticationError } from 'apollo-server-express';
import { BookDocument } from '../models/Book.js';


const resolvers = {
  Query: {
    me: async (_: any, __: any, context: any) => {
      if (context.user) {
        const userData = await User.findOne({ _id: context.user._id })
          .select('-__v -password')
          .populate('savedBooks');

        return userData;
      }
      throw new AuthenticationError('Not logged in');
    },
    // Fetch a single user by ID or username
  },

  Mutation: {
    // Create a user and return a signed token
    addUser: async (_: any, { username, email, password }: { username: string; email: string; password: string }) => {
      console.log("ADD USER");
      const user = await User.create({ username, email, password });

      if (!user) {
        throw new Error('Something went wrong!');
      }

      const token = signToken(user.username, user.password, user._id);
      return { token, user };
    },

    // Log in a user and return a signed token
    login: async (_: any, { username, email, password }: { username?: string; email?: string; password: string }) => {
      const user = await User.findOne({ $or: [{ username }, { email }] });

      if (!user) {
        throw new AuthenticationError("Can't find this user");
      }

      const correctPw = await user.isCorrectPassword(password);

      if (!correctPw) {
        throw new AuthenticationError('Wrong password!');
      }

      const token = signToken(user.username, user.password, user._id);
      return { token, user };
    },

    // Save a book to a user's `savedBooks` field
    saveBook: async (_: any, { authors, description, title, bookId, image, link }: BookDocument, context: any) => {
      if (!context.user) {
        throw new AuthenticationError('You need to be logged in!');
      }

      const updatedUser = await User.findOneAndUpdate(
        { _id: context.user._id },
        { $addToSet: { savedBooks: { authors, description, title, bookId, image, link } } }, // Prevent duplicates
        { new: true, runValidators: true }
      );

      return updatedUser;
    },

    // Remove a book from `savedBooks`
    removeBook: async (_: any, { bookId }: { bookId: string }, context: any) => {
      if (!context.user) {
        throw new AuthenticationError('You need to be logged in!');
      }

      const updatedUser = await User.findOneAndUpdate(
        { _id: context.user._id },
        { $pull: { savedBooks: { bookId } } },
        { new: true }
      );

      if (!updatedUser) {
        throw new Error("Couldn't find user with this ID!");
      }

      return updatedUser;
    },
  },
};

export default resolvers;