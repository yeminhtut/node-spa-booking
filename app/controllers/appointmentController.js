'use strict';
const Vonage = require('@vonage/server-sdk')
const Appointment = require('../models/appointment');

exports.getAll = async (req, res) => {
  let { limit, skip } = req.query;
  limit = +limit <= 100 ? +limit : 20;
  skip = +skip || 0;
  let query = {};
  const users = await Appointment.find(query)
    .limit(limit)
    .skip(skip);
  res.json(users);
};

exports.createAppointment = async (req, res) => {
  const data = {
    ...req.body,
    slot_date: req.body.appointmentDate,
    slot_time: req.body.appointmentSlot
  }
  const newAppointment = new Appointment(data);
  try {
    //const result = await newAppointment.save();
    const vonage = new Vonage({
      apiKey: "773199a7",
      apiSecret: "qQ3jqH5vBQUUjaI1"
    })

    let msg =
      req.body.name +
      " " +
      "this message is to confirm your appointment at" +
      " " +
      req.body.time_slot;

    // and saves the record to
    // the data base
    newAppointment.save((err, saved) => {
      // Returns the saved appointment
      // after a successful save
      Appointment.find({ _id: saved._id })
        .exec((err, appointment) => res.json(appointment));

      const from = "Vonage APIs"
      const to = "959756175699"

      // vonage.message.sendSms(from, to, msg, (err, responseData) => {
      //     if (err) {
      //         console.log(err);
      //     } else {
      //         if(responseData.messages[0]['status'] === "0") {
      //             console.log("Message sent successfully.");
      //         } else {
      //             console.log(`Message failed with error: ${responseData.messages[0]['error-text']}`);
      //         }
      //     }
      // })
    });
  } catch (err) {
    if (err.name === 'MongoError' && err.code === 11000) {
      return res.status(500).send('User already exist!');
    }
    return res.status(500).send(err.message);
  }
};
