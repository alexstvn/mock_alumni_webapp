const router = require("express").Router();
const errorController = require("../controllers/errorController");

//ERROR SET UP
router.use(errorController.pageNotFoundError);
router.use(errorController.internalServerError);

module.exports = router;
