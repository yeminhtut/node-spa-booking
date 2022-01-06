"use strict";
const Vonage = require("@vonage/server-sdk");
const Appointment = require("../models/appointment");
const nodemailer = require("nodemailer");
const moment = require("moment");

exports.getAll = async (req, res) => {
    let { limit, skip } = req.query;
    limit = +limit <= 100 ? +limit : 20;
    skip = +skip || 0;
    let query = {};
    const users = await Appointment.find(query).limit(limit).skip(skip);
    res.json(users);
};

exports.sendEmail = async (req, res) => {
    const { name, slot_date, slot_time, email } = req.body
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

    let mailOptions = {
        from: "aseemaidev@gmail.com",
        to: email,
        subject: "Adeva Spa Booking Confirm",
        html: `Dear ${name},<br><br>Your appointment at Adeva Spa is confirmed.<br> Here is your appointment detail,<br> Email - ${email}<br> Date - ${moment(slot_date).format('Do, dddd, MMMM')}<br/> Time- ${slot_time}`,
    };
    transporter.sendMail(mailOptions, function (err, data) {
        if (err) {
            console.log("Error " + err);
        } else {
            console.log("Email sent successfully", data);
        }
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
