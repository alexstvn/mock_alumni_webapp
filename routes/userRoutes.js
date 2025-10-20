const router = require("express").Router();
const usersController = require("../controllers/usersController");

//Route - Users
router.get("/", usersController.index, usersController.indexView);

// LOGIN FOR USERS
router.get("/login", usersController.login);
router.post("/login", usersController.authenticate);
//logout
router.get("/logout", usersController.logout, usersController.redirectView);

//new entry
router.get("/new", usersController.new);
router.post("/create", usersController.validate, usersController.create, usersController.redirectView);

//show entry
router.get("/:id", usersController.show, usersController.showView);
//edit entry
router.get("/:id/edit", usersController.edit);
router.put(
  "/:id/update",
  usersController.update,
  usersController.redirectView
);
//delete entry
router.delete(
  "/:id/delete",
  usersController.delete,
  usersController.redirectView
);

module.exports = router;
