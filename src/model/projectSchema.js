const mongoose = require('mongoose');
// Define the schema for the User entity
const projectSchema = new mongoose.Schema(
  {
    projectName: {
      type: String,
      required: true,
      unique: true, // Ensures that email is unique
    },
    des: {
      type: String,
      required: true,
    },
    createdBy: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true,
    },
  },
  {
    timestamps: true, // Automatically adds `createdAt` and `updatedAt`
  }
);



module.exports = mongoose.model('Project', projectSchema)