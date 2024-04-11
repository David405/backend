const mongoose = require("mongoose");

const jobSchema = new mongoose.Schema({
    title: {
        type: String,
        required: [true, "Job can not be empty"],
    },
    companyName: {
        type: String,
        required: [true, "Job must belong to a company"],
    },
    location: {
        type: String,
        required: true,
    },
    type: { type: String,
        enum: {
        values: ["fulltime", "remote",],
        message: "type is either fulltime, remote",
      }, 
      required: true,
    },
    level: {
        type: String,
        required: true,
    },  
    department: {
        type: String,
        required: true,
    },
    salary: {
        type: Number,
        required: true,
    },
    category: {
        type: String,
        required: true,
    },
    description: {
        type: String,
        required: true,
    },
    responsibility: {
        type: String,
        required: true
    },
    requirement: [String],
    status:{
        type:String,
        default:inactive

    },

    createdAt:{
        type:Date,
        default:Date.now()
    }
},
{
    toJSON: { virtuals: true },
    toObject: { virtuals: true },
  }
  )






const jobAd = mongoose.model("jobAd", reviewSchema);
module.exports = jobAd;
