const mongoose = require("mongoose");
const passportLocalMongoose = require("passport-local-mongoose");
const randToken = require ("rand-token");

const Schema = mongoose.Schema;
const userSchema = Schema(
  {
    name: { type: String, required: true },
    email: { type: String, required: true, lowercase: true, unique: true }, 
    role: { type: String, enum: ["student","alumni"], default:"student" },
    graduationYear: { type: Number, required: true }, 
    major: {type: String, required: true }, 
    job: { type: String }, 
    company: { type: String }, 
    city: {type: String }, 
    state: { type: String }, 
    country: { type: String }, 
    zipCode: { type: Number, min: [10000, "Zip code too short"],max:99999 },
    bio: {type: String }, 
    interests: [{ type: String }],
    events: [{ type: mongoose.Schema.Types.ObjectId, ref: "Event" }], // events user RSVPed to
    isAdmin: {type: Boolean, default: false},
    apiToken: {type: String},
  },
  {
    timestamps: true,
  }
);

userSchema.virtual("fullName").get(function () {
    return this.name;
});

//IMPLEMENTING PASSPORT
userSchema.plugin(passportLocalMongoose, {usernameField: "email"});

//GENERATE RANDOM TOKEN (W11D3)
userSchema.pre("save", function(next) {
  let user = this;
  if (!user.apiToken)
  user.apiToken = randToken.generate(16);
  next();
});

module.exports = mongoose.model("User", userSchema);