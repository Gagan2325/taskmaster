const mongoose = require('mongoose');
const bcrypt = require('bcrypt');
// Define the schema for the User entity
const userSchema = new mongoose.Schema(
  {
    email: {
      type: String,
      required: true,
      unique: true, // Ensures that email is unique
    },
    password: {
      type: String,
      required: true,
    },
    name: {
      type: String,
      required: true,
    },
    role: {
      type: String,
      required: true,
      enum: ['1', '2', '3'], // Example roles: 1 - Admin, 2 - user
    },
  },
  {
    timestamps: true, // Automatically adds `createdAt` and `updatedAt`
  }
);



// Hash password before saving the document
userSchema.pre('save', async function (next) {
  if (!this.isModified('password')) return next();

  try {
    const saltRounds = 10;
    this.password = await bcrypt.hash(this.password, saltRounds);
    next();
  } catch (error) {
    next(error);
  }
});

module.exports = mongoose.model('User', userSchema)