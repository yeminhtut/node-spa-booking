'use strict';

const appointment = require('../controllers/appointmentController');
const { catchError } = require('../lib/errorHandler');
const verifyToken = require('../lib/verifyToken');

module.exports = app => {
  app
    .route('/appointments')
    .get(catchError(appointment.getAll))
    .post(catchError(appointment.createAppointment));

  app
  .route('/send-mail')
  .post(catchError(appointment.sendEmail));
};
