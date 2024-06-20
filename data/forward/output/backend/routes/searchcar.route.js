
  /**
   * @route :["SearchCarRoute","SearchCarRoute","SearchCarRoute","CarDetailRoute"]
   * @methodName :["GET","GET","POST",null]
   * @controllerName :["getCarsList","getProvinceAndLocation","createCarOrder","getCarDetailById"]
   * @dependency :[{"name":"SearchCarRoute","value":"/:carId","supplier":"CarDetailRoute"}]
   */
  
  const express = require("express");
  
  const router = express.Router();
          
router.get("/searchcar/getCarsList", getCarsList);
router.get("/searchcar/getProvinceAndLocation", getProvinceAndLocation);
router.post("/searchcar/createCarOrder", createCarOrder);
router.undefined("/searchcar/cardetail/:carId/getCarDetailById", getCarDetailById);
  
  module.exports = router;
        