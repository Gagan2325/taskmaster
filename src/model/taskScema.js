const mongoose = require('mongoose');
// Define the schema for the User entity
const taskSchema = new mongoose.Schema(
  {
    projectId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Project',
        required: true,
    },
    taskName: {
      type: String,
      required: true,
      unique: true, 
    },
    des: {
      type: String,
      required: true,
    },
    taskStatus: {
      type: String,
      required: true,
      enum: {
        values: ['pending', 'in-progress', 'completed'],
        message: 'Task status must be one of: pending, in-progress, or completed'
      },
      default: 'pending',
      validate: {
        validator: function(value) {
          return ['pending', 'in-progress', 'completed'].includes(value);
        },
        message: 'Invalid task status. Only pending, in-progress, or completed are allowed.'
      }
    },
    createdBy: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true,
    },
    createdFor: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true,
    },
   
    remarks: {
        type: String,
    },
  },
  {
    timestamps: true,
  }
);



module.exports = mongoose.model('Task', taskSchema)