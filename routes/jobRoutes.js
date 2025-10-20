const router = require("express").Router();
const jobsController = require("../controllers/jobsController");

//Route - Jobs
router.get("/", jobsController.index, jobsController.indexView);
//new entry
router.get("/new", jobsController.new);
router.post("/create", jobsController.validate, jobsController.create, jobsController.redirectView);
//show entry
router.get("/:id", jobsController.show, jobsController.showView);
//edit an entry
router.get("/:id/edit", jobsController.edit);
router.put(
  "/:id/update",
  jobsController.update,
  jobsController.redirectView
);
//delete entry
router.delete(
  "/:id/delete",
  jobsController.delete,
  jobsController.redirectView
);

module.exports = router;
