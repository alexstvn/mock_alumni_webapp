const Job = require("../models/job");
const User = require("../models/user");

module.exports = {
  index: (req, res, next) => { //INDEX PAGE - shows all entries
    Job.find() //finding all jobs
    .then((jobs) => {
      res.locals.jobs = jobs;
      next();
    })
    .catch((error) => {
      console.log(`Error fetching jobs: ${error.message}`);
      next(error);
    });
  },
  indexView: (req, res) => { //SHOWING INDEX VIEW
    // res.render("jobs/index");
    if (req.query.format === "json") {
      res.json(res.locals.jobs);
    } else {
      res.render("jobs/index");
    }
  },
  new: (req, res) => { //SHOWS NEW VIEW
    res.render("jobs/new");
  },
  create: (req, res, next) => {
    if (req.skip) next();
    //populating parameters with inputted data
    User.findById(req.body.userId)
    .then(user => {
      let jobParams = {
        title: req.body.title,
        company: req.body.company,
        location: req.body.location,
        description: req.body.description,
        requirements: req.body.requirements,
        salary: req.body.salary,
        contactEmail: req.body.contactEmail,
        contactPhone: req.body.contactPhone,
        deadlineDate: req.body.deadlineDate,
        isActive: req.body.isActive === 'on', // assuming a checkbox for isActive
        creator: user, //tracking creator
      };
      
      //loading into new row
      Job.create(jobParams)
      .then((job) => {
        req.flash("success", `${job.title} added successfully!`);
        res.locals.redirect = "/jobs";
        res.locals.job = job;
        next();
      })
      .catch((error) => {
        console.log(`Error saving job: ${error.message}`);
        // req.flash("error", `Job failed to be added.`); - COMMENTED OUT FOR VALIDATION FLASHES 
        res.locals.redirect = "/jobs/new";
        next();
      });
      })
      .catch(error => {
        console.log(`Error fetching user: ${error.message}`);
        res.locals.redirect = "/jobs/new";
        next();
      });
    },
  redirectView: (req, res, next) => { //REDIRECTS VIEWS AS NECESSARY
    let redirectPath = res.locals.redirect;
    if (redirectPath) res.redirect(redirectPath);
    else next();
  },
  show: (req, res, next) => { //DATA GENERATION BEHIND SHOWING PARTICULAR ENTRY
    let jobId = req.params.id;
    Job.findById(jobId)
    .then((job) => {
      res.locals.job = job; //loading in data from row
      next();
    })
    .catch((error) => {
      res.status(404).render('page_not_found');
      console.log(`Error fetching job by ID: ${error.message}`);
      next(error);
    });
  },
  showView: (req, res) => { //SHOWS SHOW VIEW
    res.render("jobs/show");
  },
  edit: (req, res, next) => { //SHOWS EDIT VIEW (searches by ID)
    let jobId = req.params.id;
    Job.findById(jobId)
    .then((job) => {
      res.render("jobs/edit", {
        job: job,
      });
    })
    .catch((error) => {
      console.log(`Error fetching job by ID: ${error.message}`);
      next(error);
    });
  },
  update: (req, res, next) => {
    let jobId = req.params.id,
    jobParams = {
      title: req.body.title,
      company: req.body.company,
      location: req.body.location,
      description: req.body.description,
      requirements: req.body.requirements,
      salary: req.body.salary,
      contactEmail: req.body.contactEmail,
      contactPhone: req.body.contactPhone,
      deadlineDate: req.body.deadlineDate,
      isActive: req.body.isActive === 'on', // assuming a checkbox for isActive
    };
    
    //UPDATING DATA
    Job.findByIdAndUpdate(jobId, {
      $set: jobParams,
    })
    .then((job) => {
      req.flash("success", `Job edited successfully!`);
      res.locals.redirect = `/jobs/${jobId}`; //REDIRECTING TO SHOW VIEW
      res.locals.job = job;
      next();
    })
    .catch((error) => {
      req.flash("error", `Job failed to save changes.`);
      console.log(`Error updating job by ID: ${error.message}`);
      next(error);
    });
  },
  delete: (req, res, next) => { //DELETING ENTRY
    let jobId = req.params.id;
    Job.findByIdAndDelete(jobId) //delete entry by ID
    .then(() => {
      req.flash("success", `Job deleted successfully.`);
      res.locals.redirect = "/jobs"; //redirecting to home view
      next();
    })
    .catch((error) => {
      req.flash("error", `Job failed to delete.`);
      console.log(`Error deleting job by ID: ${error.message}`);
      next();
    });
  },
  validate: (req, res, next) => {
    //CHECK VALID SALARY (integer)
    req.check("salary", "Salary is invalid").notEmpty().isInt();

    //CHECK VALID EMAIL
    req.check("contactEmail", "Email is invalid").isEmail();

    // CHANGE CONTACT EMAIL TO LOWER CASE
    req.sanitizeBody("contactEmail").normalizeEmail({
      all_lowercase: true,
    }).trim();
    
    //VALIDATION MESSAGE
    req.getValidationResult().then((error) => {
      if(!error.isEmpty()) {
        let messages = error.array().map((e) => e.msg);
        req.skip = true;
        req.flash("error", messages.join(" and "));
        res.locals.redirect = "/jobs/new";
        next();
      } else {
        next();
      }
    });
  },
};
