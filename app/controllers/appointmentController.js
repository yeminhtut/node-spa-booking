"use strict";
const Vonage = require("@vonage/server-sdk");
const Appointment = require("../models/appointment");
const nodemailer = require("nodemailer");
const moment = require("moment");
const handlebars = require('handlebars');
var fs = require('fs');

var readHTMLFile = function(path, callback) {
    fs.readFile(path, {encoding: 'utf-8'}, function (err, html) {
        if (err) {
            console.log('first block', err)
           callback(err); 
           throw err;
            
        }
        else {
            callback(null, html);
        }
    });
};

exports.getAll = async (req, res) => {
    let { limit, skip } = req.query;
    limit = +limit <= 100 ? +limit : 20;
    skip = +skip || 0;
    let query = {};
    const users = await Appointment.find(query).limit(limit).skip(skip);
    res.json(users);
};

exports.sendEmail = async (req, res) => {
    const { name, slot_date, slot_time, email, treatmentType } = req.body
    let transporter = nodemailer.createTransport({
        service: "gmail",
        auth: {
            type: "OAuth2",
            user: "aseemaidev@gmail.com",
            pass: "Me$$enger21",
            clientId:
                "245519298538-65o5s2tc8410pac9j0meih1to052ca7s.apps.googleusercontent.com",
            clientSecret: "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",
            refreshToken:
                "1//04PzXGNKPQ8FLCgYIARAAGAQSNwF-L9IraT3cZBbe-mr7_mOyxUHZL8uL9Ucc2-YGvP8Sh5UbY7lnyI8nmjXW3eSJ3v6pC6zGocE",
        },
    });
    transporter.verify((err, success) => {
        err
            ? console.log(err)
            : console.log(
                  `=== Server is ready to take messages: ${success} ===`
              );
    });
    
    readHTMLFile(__dirname +'/adeva.html', function(err, html) {
        //console.log('gee', html)
        var template = handlebars.compile(html);
        var replacements = {
            treatment: JSON.parse(treatmentType).itemName,
            timeSlot: slot_time,
            bookingTime: moment(slot_date).format('dddd D MMMM')
        };
        var htmlToSend = template(replacements);
        var mailOptions = {
            from: "aseemaidev@gmail.com",
            to: email,
            subject: "Your ADEVA Spa session details",
            html : htmlToSend
         };
         transporter.sendMail(mailOptions, function (error, response) {
            if (error) {
                console.log(error);
                callback(error);
            }
        });
    });
    res.json({ success: true });
};

exports.createAppointment = async (req, res) => {
    const data = {
        ...req.body,
        slot_date: req.body.appointmentDate,
        slot_time: req.body.appointmentSlot,
    };
    const newAppointment = new Appointment(data);
    try {
        //const result = await newAppointment.save();
        const vonage = new Vonage({
            apiKey: "773199a7",
            apiSecret: "qQ3jqH5vBQUUjaI1",
        });

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
            Appointment.find({ _id: saved._id }).exec((err, appointment) =>
                res.json(appointment)
            );

            const from = "Vonage APIs";
            const to = "959756175699";

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
        if (err.name === "MongoError" && err.code === 11000) {
            return res.status(500).send("User already exist!");
        }
        return res.status(500).send(err.message);
    }
};
