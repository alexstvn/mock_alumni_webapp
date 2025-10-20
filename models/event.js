const mongoose = require("mongoose");
const User = require("./user");
const Schema = mongoose.Schema;
const eventSchema = Schema(
  {
    title: {type: String, required: false },
    description: { type: String, required: false },
    location: {type: String, required: false }, 
    startDate: { type: Date, required: true }, 
    endDate: { type: Date, required: true }, 
    isOnline: { type: Boolean, default: false }, 
    registrationLink: { type: String },
    organizer: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    attendees: [{ type: mongoose.Schema.Types.ObjectId, ref: 'User' }], //used in beginning of project to track interested users 
    RSVPs: [{ type: mongoose.Schema.Types.ObjectId, ref: 'User' }],
    creator: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true }
  },
  {
    timestamps: true,
  }
);

eventSchema.virtual("fullName").get(function () {
    return this.title;
});

module.exports = mongoose.model("Event", eventSchema);