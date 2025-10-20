const router = require("express").Router();

const userRoutes = require("./userRoutes"),
    jobRoutes = require("./jobRoutes"),
    eventRoutes = require("./eventRoutes"),
    errorRoutes = require("./errorRoutes"),
    apiRoutes = require("./apiRoutes"),
    homeRoutes = require("./homeRoutes");

router.use("/users", userRoutes);
router.use("/jobs", jobRoutes);
router.use("/events", eventRoutes);
router.use("/", homeRoutes);
router.use("/api", apiRoutes);
router.use("/", errorRoutes);

module.exports = router;
