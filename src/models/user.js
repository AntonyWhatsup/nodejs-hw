import mongoose from 'mongoose';
import bcrypt from 'bcrypt';

const userSchema = new mongoose.Schema({
  username: { type: String, trim: true },
  email: { type: String, required: true, unique: true, trim: true },
  password: { type: String, required: true },
  avatar: {
    type: String,
    default: 'https://ac.goit.global/fullstack/react/default-avatar.jpg'
  },
}, { timestamps: true });

userSchema.pre('save', async function (next) {
  if (!this.username) this.username = this.email;
  if (this.isModified('password')) {
    const salt = await bcrypt.genSalt(10);
    this.password = await bcrypt.hash(this.password, salt);
  }
  next();
});

userSchema.methods.toJSON = function () {
  const obj = this.toObject();
  delete obj.password;
  return obj;
};

export const User = mongoose.model('User', userSchema);
