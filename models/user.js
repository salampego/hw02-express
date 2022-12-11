const gravatar = require("gravatar");
const { v4: uuidv4 } = require("uuid");
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");
const createError = require("http-errors");
const sgMail = require("@sendgrid/mail");

const { User, schemas } = require("./user.model");

const register = async (email, password, subscription) => {
  const { error } = schemas.register.validate({
    email,
    password,
    subscription,
  });
  if (error) {
    throw createError(400, error.message);
  }
  const user = await User.findOne({ email });
  if (user) {
    throw createError(409, `${email} already exists`);
  }
  const avatar = gravatar.url(email, {
    s: "200",
    r: "pg",
    d: "404",
  });
  const hashPassword = await bcrypt.hash(password, 10);
  const verificationToken = uuidv4();

  const msgVerification = {
    to: email,
    from: "samplelogo19@gmail.com",
    subject: "Please Verify Your Account",
    text: `Let's verify your email. Click on the link to confirm email http://localhost:3000/api/users/verify/${verificationToken}`,
    html: `<h2> Let's verify your email. </h2> <p>Click on the link to confirm email http://localhost:3000/api/users/verify/${verificationToken}</p>`,
  };

  const result = await User.create({
    email,
    password: hashPassword,
    subscription,
    avatarURL: avatar,
    verificationToken,
  });

  sgMail.send(msgVerification);

  return result;
};

const login = async (email, password) => {
  const { error } = schemas.login.validate({ email, password });
  if (error) {
    throw createError(400, error.message);
  }
  const user = await User.findOne({ email });
  if (!user || user.verify) {
    throw createError(401, "Wrong email");
  }
  const comparePassword = await bcrypt.compare(password, user.password);
  if (!comparePassword) {
    throw createError(401, `Wrong password`);
  }
  const payload = { id: user._id };
  const token = jwt.sign(payload, process.env.JWT_SECRET, { expiresIn: "24h" });
  await User.findByIdAndUpdate(user._id, { token }, { new: true });
  return token;
};

module.exports = { register, login };
