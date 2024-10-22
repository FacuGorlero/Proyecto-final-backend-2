const { configObject } = require("./index.js");
const passport = require("passport");
const passport_jwt = require("passport-jwt");
const GithubStrategy = require("passport-github2");
const { userService } = require("../repositories/services.js");
const { logger } = require("../utils/logger");

const JWTStrategy = passport_jwt.Strategy;
const ExtractJWT = passport_jwt.ExtractJwt;
const usersService = userService;
console.log(configObject);

exports.initializePassport = () => {
  const cookieExtractor = (req) => {
    let token = null;
    if (req && req.cookies) {
      token = req.cookies["token"];
    }
    return token;
  };

  // Configuración de la estrategia JWT para Passport
  passport.use(
    "jwt",
    new JWTStrategy(
      {
        jwtFromRequest: ExtractJWT.fromExtractors([cookieExtractor]),
        secretOrKey: configObject.jwt_code,
      },
      async (jwt_payload, done) => {
        try {
          // La lógica de verificación del token va aquí
          // Puedes realizar acciones como buscar el usuario en la base de datos utilizando el payload del token
          // Por ejemplo, puedes hacer algo como: const user = await User.findById(jwt_payload.sub);

          // Si la verificación es exitosa, se pasa el usuario al siguiente middleware
          logger.info("jwt_payload passport config: ", jwt_payload);
          return done(null, jwt_payload);
        } catch (error) {
          return done(error);
        }
      }
    )
  );

  // Configuración de la estrategia de autenticación de GitHub
  passport.use(
    "github",
    new GithubStrategy(
      {
        clientID: configObject.gh_client_id,
        clientSecret: configObject.gh_client_secret,
        callbackURL: "http://localhost:8080/api/session/githubcallback",
      },
      async (accesToken, refreshToken, profile, done) => {
        try {
          console.log(profile);
          let user = await usersService.getUserBy({
            email: profile._json.email,
          });
          if (!user) {
            let newUser = {
              first_name: profile.username,
              last_name: profile.username,
              email: profile._json.email,
              password: "123"
            };
            let result = await userService.createUser(newUser);
            logger.info("Este es el nuevo usaurio", result);
            return done(null, result);
          }
          done(null, user);
        } catch (err) {
          return done(err);
        }
      }
    )
  );

  // Serializar al usuario para almacenarlo en la sesión
  passport.serializeUser((user, done) => {
    done(null, user.id);
  });

  // Deserializar al usuario a partir del ID almacenado en la sesión
  passport.deserializeUser(async (id, done) => {
    let user = await usersService.getUserBy({ _id: id });
    done(null, user);
  });
};
