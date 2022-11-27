const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");
const createError = require("http-errors");
const { User, schemas } = require("./user.model");

const register = async (email, password) => {
  const { error } = schemas.register.validate({ email, password });
  if (error) {
    throw createError(400, error.message);
  }
  const user = await User.findOne({ email });
  if (user) {
    throw createError(409, `${email} already exists`);
  }
  const hashPassword = await bcrypt.hash(password, 10);
  const result = await User.create({
    ...{ email, password },
    password: hashPassword,
  });
  return result;
};

const login = async (email, password) => {
  const { error } = schemas.login.validate({ email, password });
  if (error) {
    throw createError(400, error.message);
  }
  const user = await User.findOne({ email });
  if (!user) {
    throw createError(401, "Wrong email");
  }
  const comparePassword = await bcrypt.compare(password, user.password);
  if (!comparePassword) {
    throw createError(401, "Wrong password");
  }
  const payload = { id: user._id };
  const token = jwt.sign(payload, process.env.JWT_SECRET, { expiresIn: "24h" });
  await User.findByIdAndUpdate(user._id, { token });
  return token;
};
const logout = async (id) => {
  // const
};
module.exports = { register, login, logout };
