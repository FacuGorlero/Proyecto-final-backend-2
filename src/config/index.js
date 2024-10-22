const dotenv = require("dotenv");
const { program } = require("./commander.js");
const session = require("express-session");
const MongoStore = require("connect-mongo");
const { connect } = require("mongoose");
const { logger } = require("../utils/logger");

const opts = program.opts();

dotenv.config();

const configObject = {
  port: process.env.PORT,
  jwt_code: process.env.JWT_SECRET_CODE,
  cookies_code: process.env.COOKIES_SECRET_CODE,
  mongo_uri: process.env.MONGO_URI,
  mongo_secret_code: process.env.MONGO_SECRET_CODE,
  gh_client_id: process.env.GITHUB_CLIENT_ID,
  gh_client_secret: process.env.GITHUB_CLIENT_SECRET,
  development: opts.mode == "development",
  persistence: process.env.PERSISTENCE,
  gmail_user_app: process.env.GMAIL_USER_APP,
  gmail_password_app: process.env.GMAIL_PASSWORD_APP,

  connectDB: async () => {
    MongoSingleton.getInstance();
    logger.info("Db connected");
  },
  sessionAtlas: (app) => {
    app.use(
      session({
        store: MongoStore.create({
          mongoUrl: process.env.MONGO_URL, //
          mongoOptions: {
            useNewUrlParser: true,
            useUnifiedTopology: true,
          },
          ttl: 15000000000,
        }),
        secret: process.env.MONGO_SECRET_CODE,
        resave: true,
        saveUninitialized: true,
      })
    );
  },
};
class MongoSingleton {
  static instance; //
  constructor() {
    connect(process.env.MONGO_URI);
  }

  static getInstance() {
    if (!this.instance) {
      logger.info("Connecting to data base");
      return (this.instance = new MongoSingleton());
    }
    logger.info("Base de Datos ya conectada");
    return this.instance;
  }
}

module.exports = { configObject, MongoSingleton };
