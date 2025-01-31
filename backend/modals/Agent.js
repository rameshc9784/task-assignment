import mongoose from 'mongoose';
import bcrypt from 'bcrypt';

const agentSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true
  },
  mobile: {
    type: Number,
    required: true,
  },
  email : {
    type: String,
    required: true,
    unique: true
  },
  password: {
    type: String,
    required: true
  },
  tasks: {
    type: Array,
    default: [],
  },
});

agentSchema.pre('save', async function(next) {
  if (this.isModified('password')) {
    this.password = await bcrypt.hash(this.password, 10);
  }
  next();
});

const Agent = mongoose.model('Agent', agentSchema);
export default Agent;