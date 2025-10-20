const User = require("../models/user");
const Event = require("../models/event");
const passport=require("passport"); 
const token = process.env.TOKEN || "busaaT0k3n";

const getUserParams = (body) => {
  return {
    name: body.name,
    email: body.email,
    password: body.password,
    zipCode: body.zipCode,
    graduationYear: body.graduationYear,
    major: body.major,
    job: body.job,
    company: body.company,
    city: body.city,
    state: body.state,
    country: body.country,
    bio: body.bio,
    interests: body.interests.split(','), // Interests are separated by ,
  };
};

module.exports = {
  index: (req, res, next) => { //LOADING DATA FOR INDEX VIEW
    User.find() //removing column so it doesn't get seen by user
    .then((users) => {
      res.locals.users = users;
      next();
    })
    .catch((error) => {
      res.render("user_not_found"); //redirecting to error page
      console.log(`Error fetching users: ${error.message}`);
      next(error);
    });
  },
  indexView: (req, res) => { res.render("users/index"); }, //INDEX VIEW PAGE
  new: (req, res) => { //NEW VIEW PAGE
    res.render("users/new");
  },
  create: (req, res, next) => { //LOADING DATA INTO NEW ENTRY
    if (req.skip) next();
    let newUser = new User(getUserParams(req.body));
    User.register(newUser, req.body.password, (error, user) => {
      if (user) {
        req.flash(
          "success",
          `${user.fullName}'s account created successfully!`
        );
        res.locals.redirect = "/users";
        next();
      } else {
        req.flash(
          "error",
          `Failed to create user account because:${error.message}.`
        );
        res.locals.redirect = "/users/new";
        next();
      }
    });
  },
  redirectView: (req, res, next) => { //REDIRECTION FOR ROUTING
    let redirectPath = res.locals.redirect;
    if (redirectPath) res.redirect(redirectPath);
    else next();
  },
  show: (req, res, next) => { //LOADING DATA FOR SHOWING PARTICULAR ENTRY
    let userId = req.params.id;
    User.findById(userId)
    .then((user) => {
      res.locals.user = user;
      next();
    })
    .catch((error) => {
      res.render("user_not_found"); //redirecting to error page
      console.log(`Error fetching user by ID: ${error.message}`);
      next(error);
    });
  },
  showView: (req, res) => { //SHOW VIEW PAGE
    res.render("users/show");
  },
  edit: (req, res, next) => { //EDIT PAGE - Grabbing user to be editted
    let userId = req.params.id;
    User.findById(userId)
    .then((user) => {
      res.render("users/edit", {
        user: user,
      });
    })
    .catch((error) => {
      res.render("server_error"); //redirecting to error page
      console.log(`Error fetching user by ID: ${error.message}`);
      next(error);
    });
  },
  update: (req, res, next) => { //UPDATING DATA INPUTTED FROM EDIT
    let userId = req.params.id,
    userParams = getUserParams(req.body);
    
    User.findByIdAndUpdate(userId, {
      $set: userParams, //setting new values for column value
    })
    .then((user) => {
      req.flash("success", `${user.fullName} edited successfully!`);
      res.locals.redirect = `/users/${userId}`;
      res.locals.user = user;
      next();
    })
    .catch((error) => {
      req.flash("error", `User failed to save changes.`);
      console.log(`Error updating user by ID: ${error.message}`);
      next(error);
    });
  },
  delete: async (req, res, next) => { //DELETING ENTRY
    try {
      //FINDING USER
      let userId = req.params.id;
      const deletedUser = await User.findById(userId);
      
      // DELETING THE USER
      await User.findByIdAndDelete(userId);
      
      //REDIRECTION TO MAIN PAGE
      req.flash("success", `User deleted successfully!`);
      res.locals.redirect = "/users";
      next();
    } catch (error) {
      console.log(`Error deleting user by ID: ${error.message}`);
      next(error);
    }
  },
    login: (req, res) => { //RENDER LOGIN PAGE
      res.render("users/login");
    },
    authenticate: passport.authenticate("local", { //AUTHENTICATE USER (W10D1)
      failureRedirect: "/users/login",
      failureFlash: "Failed to login.",
      successRedirect: "/" // no successful flash message
    }),
    validate: (req, res, next) => {
      // CHANGE EMAIL TO LOWER CASE
      req.sanitizeBody("email").normalizeEmail({
        all_lowercase: true,
      }).trim();
      
      //CHECK VALID EMAIL
      req.check("email", "Email is invalid").isEmail();
      
      // CHECK ZIP CODE
      req.check("zipCode", "Zip code is invalid").notEmpty().isInt().isLength({
        min: 5,
        max: 5,
      }).equals(req.body.zipCode);
      
      //PASSWORD
      req.check("password", "Password cannot be empty").notEmpty();
      
      //VALIDATION MESSAGE
      req.getValidationResult().then((error) => {
        if(!error.isEmpty()) {
          let messages = error.array().map((e) => e.msg);
          req.skip = true;
          req.flash("error", messages.join(" and "));
          res.locals.redirect = "/users/new";
          next();
        } else {
          next();
        }
      });
    },
    logout: (req, res, next) => { //LOGGING USER OUT (W10D2)
      req.logout(function (err) {
        if (err) {
          return next(err);
        }
      req.flash("success", "You have been logged out!");
      res.locals.redirect = "/";
      next();
      });
    },
    verifyToken: (req, res, next) => { //ADDING TOKEN (W11D3)
      let token = req.query.apiToken;
  
      if (token) {
        User.findOne({ apiToken: token })
          .then((user) => {
            if (user) next();
            else next(new Error("Invalid API token"));
          })
          .catch((error) => {
            next(new Error(error.message));
          });
      } else next(new Error("Invalid API token"));
    },
  };
