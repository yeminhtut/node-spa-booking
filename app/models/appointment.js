'use strict';

const mongoose = require('mongoose');
mongoose.promise = global.Promise;
const Schema = mongoose.Schema;

let AppointmentSchema = new Schema({
  outlet: {
    type: String
  },
  treatment: {
    type: String
  },
  nric: {
    type: String
  },
  name: {
    type: String
  },
  email: {
    type: String
  },
  slot_time: {
    type: String,
  },
  slot_date: {
    type: String,
  },
  createdAt: {
    type: Date,
    default: Date.now,
  },
  updatedAt: {
    type: Date,
    default: Date.now,
  },
});

AppointmentSchema.pre('save', function(next) {
  next();
});

module.exports = mongoose.model('Appointments', AppointmentSchema);
