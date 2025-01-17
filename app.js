const express = require("express");
const logger = require("morgan");
const cors = require("cors");

const contactsRouter = require("./routes/api/contactsRouter");
const usersRouter = require("./routes/api/usersRouter");
const app = express();

const formatsLogger = app.get("env") === "development" ? "dev" : "short";

app.use(logger(formatsLogger));
app.use(cors());
app.use(express.json());

app.use("/api/contacts", contactsRouter);
app.use("/api/users", usersRouter);
app.use("/public", express.static("public"));

app.use((_, res) => res.status(404).json({ message: "Not Found" }));

app.use((err, _, res, __) => {
  const { status = 500, message = "Server internal error" } = err;
  res.status(status).json({ message });
});

module.exports = app;
