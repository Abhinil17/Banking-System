const mongoose = require('mongoose');
const bcrypt = require('bcrypt');

const userSchema = new mongoose.Schema({
  username: {
    type: String,
    required: true,
  },
  email: {
    type: String,
    required: true,
    trim: true,
    lowercase: true,
    match: [/\S+@\S+\.\S+/, 'is invalid'],
    unique: true,
  },
  password: {
    type: String,
    required: true,
    minlength: [6, 'Password must be at least 6 characters long'],
    select: false,
  },
  systemUser: {
    type: Boolean,
    default: false,
    immutable: true,
    select: false,
  },
},
{
  timestamps: true,
});

userSchema.pre('save', async function (next) {
  if (!this.isModified('password')) {
    return;
  }
  const hash = await bcrypt.hash(this.password, 10);
  this.password = hash;
  return ;
});

userSchema.methods.comparePassword = async function (password) {
  return bcrypt.compare(password, this.password);
};

const userModel = mongoose.model('user', userSchema);

module.exports = userModel;