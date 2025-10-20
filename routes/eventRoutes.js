const router = require("express").Router();
const eventsController = require("../controllers/eventsController");

//Route - Events
router.get("/", eventsController.index, eventsController.indexView); //showing main page

//new entry
router.get("/new", eventsController.new); //making new row
router.post("/create", eventsController.validate, eventsController.create, eventsController.redirectView);
router.get("/:id", eventsController.show, eventsController.showView); //showing particular entry

//interested in attending event - not needed unless doing interested events form input
// router.post('/:eventId/attend', eventsController.attendEvent);

//editing entry
router.get("/:id/edit", eventsController.edit); 
router.put(
  "/:id/update",
  eventsController.update,
  eventsController.redirectView
);
//deleting entry
router.delete( 
  "/:id/delete",
  eventsController.delete,
  eventsController.redirectView
);

module.exports = router;
