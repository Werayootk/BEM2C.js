
  /**
   * @route :["BookingsRoute","BookingRoute","BookingRoute"]
   * @methodName :["GET","GET","PATCH"]
   * @controllerName :["getBookingList","getBookingByStatus","cancelBookingById"]
   * @dependency :[{"name":"BookingsRoute","value":"/:bookingId","supplier":"BookingRoute"}]
   */
  
  const express = require("express");
  
  const router = express.Router();
          
router.get("/bookings/getBookingList", getBookingList);
router.get("/bookings/booking/:bookingId/getBookingByStatus", getBookingByStatus);
router.patch("/bookings/booking/:bookingId/cancelBookingById", cancelBookingById);
  
  module.exports = router;
        