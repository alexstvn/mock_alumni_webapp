const Event = require("../models/event");
const User = require("../models/user");
const httpStatus = require("http-status-codes");

//FUNCTION TO FIND/EDIT ORGANIZER
async function findOrganizer(organizerName, res) {
  try {
    //FINDING ORGANIZER
    const organizer = await User.findOne({ name: organizerName }); 
    if (organizer === null) { //goes to error page if cannot be found
      console.error('Organizer not found');
      res.status(400).render('user_not_found');
      return null;
    }
    return organizer._id; // Organizer exists: linking to object
  } catch (error) {
    console.error('Error finding organizer:', error);
    res.status(500).render('server_error');
    return null; 
  }
}
//FUNCTION USED TO FIND ATTENDEES + RETURN NEW/UPDATED ONES
async function findAttendees(newAttendees, res) {
  try {
    //FINDING ATTENDEES
    // Making array separated by comma
    const attendeesNames = newAttendees.split(',').map(name => name.trim());
    // Find the user objects by names
    const attendees = await User.find({ name: { $in: attendeesNames } }); //$in = equals any value in the array
    
    if (attendees.length < attendeesNames.length && attendeesNames[0].length != 0) { //goes to new users if cannot be found
      res.redirect('/users/new');
      return null;
    }
    return attendees.map(user => user._id); //returning array of user objects as attendees
  } catch (error) {
    console.error('Error finding attendees:', error);
    res.status(500).render('server_error');
    return null;  
  }
}

module.exports = {
  index: (req, res, next) => { //LOADING DATA FOR INDEX VIEW PAGE
    Event.find()
    .populate('organizer') //making sure that organizer + attendees comes up in index view
    .populate('RSVPs')
    .then((events) => {
      res.locals.events = events;
      next();
    })
    .catch((error) => {
      res.locals.redirect = "/server_error"; //redirecting to index page
      console.log(`Error fetching events: ${error.message}`);
      next(error);
    });
  },
  indexView: (req, res) => { 
    res.render("events/index");
  }, //INDEX VIEW PAGE
  new: (req, res) => { //NEW VIEW PAGE
    res.render("events/new");
  },
  create: async (req, res, next) => {
    if (req.skip) return next();
    
    try {
      const user = await User.findById(req.body.userId);
      
      let eventParams = {
        title: req.body.title,
        description: req.body.description,
        location: req.body.location,
        startDate: req.body.startDate,
        endDate: req.body.endDate,
        isOnline: req.body.isOnline === 'on',
        registrationLink: req.body.registrationLink,
        attendees: [], // Make it empty at first
        creator: user, // This might need adjustment if 'user' doesn't contain the ID directly
      };
      
      // FINDING + ASSIGNING ORGANIZER
      const organizerId = await findOrganizer(req.body.organizerName, res);
      if (!organizerId) {
        return; // Exit the function if organizer is not found
      }
      eventParams.organizer = organizerId;
      
      // FINDING ATTENDEES - not needed due to RSVPs
      // const newAttendees = await findAttendees(req.body.attendeesNames, res);
      // if (!newAttendees) {
      //   return; // Exit the function if attendees are not found
      // }
      // eventParams.attendees = newAttendees;
      
      // CREATING EVENT
      const event = await Event.create(eventParams);
      req.flash("success", `${event.fullName} created successfully!`);
      res.locals.redirect = "/events";
      res.locals.event = event;
      next();
    } catch (error) {
      console.log(`Error creating event: ${error.message}`);
      req.flash("error", `Error creating event. Please try again.`);
      res.locals.redirect = "/events/new";
      next(error);
    }
  },
  redirectView: (req, res, next) => { //REDIRECTING VIEWS
    let redirectPath = res.locals.redirect;
    if (redirectPath) res.redirect(redirectPath);
    else next();
  },
  show: (req, res, next) => { //LOADING DATA VALUES INTO PARTICULAR SHOW ENTRY VIEW
    let eventId = req.params.id;
    Event.findById(eventId)
    .populate('organizer') //makes sure that organizer + attendee names are shown
    .populate('RSVPs')
    .then((event) => {
      res.locals.event = event;
      next();
    })
    .catch((error) => {
      res.status(404).render('page_not_found');
      console.log(`Error fetching event by ID: ${error.message}`);
      next(error);
    });
  },
  showView: (req, res) => { //SHOW VIEW PAGE
    res.render("events/show");
  },
  edit: (req, res, next) => { //EDIT VIEW PAGE
    let eventId = req.params.id;
    Event.findById(eventId)
    .populate('organizer') //shows what organizer + attendees are already in the entry
    // .populate('attendees') - not needed due to RSVPs
    .then((event) => {
      res.render("events/edit", {
        event: event,
      });
    })
    .catch((error) => {
      console.log(`Error fetching event by ID: ${error.message}`);
      next(error);
    });
  },
  update: async (req, res, next) => { //UPDATING DATA VALUES
    let eventId = req.params.id,
    eventParams = {
      title: req.body.title,
      description: req.body.description,
      location: req.body.location,
      startDate: req.body.startDate,
      endDate: req.body.endDate,
      isOnline: req.body.isOnline === 'on',
      registrationLink: req.body.registrationLink,
      organizer: req.body.organizerName.trim(), //user inputs organizer name (not ID) in form
      // attendees: req.body.attendeesNames.split(','), - not needed due to RSVPs
    };
    
    // FINDING + ASSIGNING ORGANIZER 
    const organizerId = await findOrganizer(req.body.organizerName.trim(), res);
    if (!organizerId) {
      return; // Exit the function if organizer is not found
    }
    eventParams.organizer = organizerId;
    
    //FINDING ATTENDEES
    // const newAttendees = await findAttendees(req.body.attendeesNames, res);
    // if (!newAttendees) {
    //   return; // Exit the function if attendees is not found
    // }
    // eventParams.attendees = newAttendees;
    
    //UPDATING EVENT INFO
    Event.findByIdAndUpdate(eventId, {
      $set: eventParams,
    })
    .then((event) => {
      req.flash("success", `${event.fullName} edited successfully!`);
      res.locals.redirect = `/events/${eventId}`; //redirecting to show view page
      res.locals.event = event;
      next();
    })
    .catch((error) => {
      req.flash("error", `Error editing event. Please try again.`);
      console.log(`Error updating job by ID: ${error.message}`);
      next(error);
    });
  },
  delete: (req, res, next) => { //DELETING ENTRY
    let eventId = req.params.id;
    Event.findByIdAndDelete(eventId) //deleting particular entry
    .then(() => {
      req.flash("success", `Event deleted successfully!`);
      res.locals.redirect = "/events"; //redirecting to index page
      next();
    })
    .catch((error) => {
      req.flash("error", `The event failed to delete.`);
      console.log(`Error deleting event by ID: ${error.message}`);
      next(error);
    });
  },
  attendEvent: async (req, res) => { //CHECKS IF SOMEONE IS INTERESTED TO ATTEND AN EVENT - not needed due to RSVPs but I kept it just in case we want to reimplement checking if a user exists
    const eventId = req.params.eventId;
    const interestedUserName = req.body.interestedUserName; //interested User's name
    
    try {
      // FIND EVENT + USER
      const event = await Event.findById(eventId);
      const user = await User.findOne({ name: interestedUserName });
      // USER DOESNT EXIST: New User page
      if (!user || event.attendees.includes(user._id)) {
        return res.redirect('/users/new');
      }
      // USER EXISTS: Adds user to attendees
      event.attendees.push(user._id);
      
      // UPDATES EVENT + SAVES
      await event.save();
      await user.save();      
      // REDIRECT TO SHOW PAGE
      res.redirect(`/events/${eventId}`);
    } catch (error) {
      console.error(error);
      // Handle the error appropriately
      res.status(500).send('Internal Server Error');
    }
  },
  validate: (req, res, next) => {
    req.check("title", "Title cannot be empty.").notEmpty();
    
    req.check("description", "Description cannot be empty.").notEmpty();
    
    req.check("location", "Location cannot be empty.").notEmpty();
    
    req.check("startDate", "Start Date cannot be empty.").notEmpty();
    
    req.check("endDate", "End date cannot be empty.").notEmpty();
    
    //CHECK REGISTRATION LINK
    if (req.body.registrationLink) {
      req.check("registrationLink", "Website URL is invalid").isURL({ require_protocol: false });
    }
    //VALIDATION MESSAGE
    req.getValidationResult().then((error) => {
      if(!error.isEmpty()) {
        let messages = error.array().map((e) => e.msg);
        req.skip = true;
        req.flash("error", messages.join(" and "));
        res.locals.redirect = "/events/new";
        next();
      } else {
        next();
      }
    });
  },
  respondJSON: (req, res) => { //GRABBING DATA AS JSON
    res.json({
      status: httpStatus.OK,
      data: res.locals,
    });
  },
  errorJSON: (error, req, res, next) => { //ERROR FOR JSON RESPONSE
    let errorObject;
    if (error) {
      errorObject = {
        status: httpStatus.INTERNAL_SERVER_ERROR,
        message: error.message,
      };
    } else {
      errorObject = {
        status: httpStatus.INTERNAL_SERVER_ERROR,
        message: "Unknown Error.",
      };
    }
    res.json(errorObject);
  },
  join: (req, res, next) => {
    let eventId = req.params.id,
      currentUser = req.user;
  
    if (currentUser) {
      User.findByIdAndUpdate(
        currentUser._id, // Assuming currentUser._id is the user's ObjectId
        {
          $addToSet: {
            events: eventId, //adding to events field (events user RSVPed for) for a user object
          },
        }
      )
        .then(() => {
          // After updating the user's events, update the event's RSVPs
          return Event.findByIdAndUpdate(
            eventId,
            {
              $addToSet: {
                RSVPs: currentUser._id, // adding to list of RSVPs for events
              },
            }
          );
        })
        .then(() => {
          res.locals.success = true;
          next();
        })
        .catch((error) => {
          next(error);
        });
    } else {
      next(new Error("User must log in."));
    }
  },
  filterUserEvents: (req, res, next) => {
    // Get the current user from res.locals
    let currentUser = res.locals.currentUser;
    // Check if there is a current user
    if (currentUser) {
      // Map through the events in res.locals
      let mappedEvents = res.locals.events.map((event) => {
        // Check if the current user has joined the event
        let userJoined = currentUser.events.some((userEvent) => {
          //whether if an event is in a user's rsvped events
          return userEvent.equals(event._id);
        });
        // Add a 'joined' property to the event object indicating whether the user has joined
        return Object.assign(event.toObject(), { joined: userJoined });
      });
      // Update res.locals.events with the mapped events
      res.locals.events = mappedEvents;
      // Continue to the next middleware
      next();
    } else {
      // If there is no current user, continue to the next middleware
      next();
    }
  },
};