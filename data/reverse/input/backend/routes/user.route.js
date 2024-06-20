
  /**
   * @route :["UserRoute","UserRoute","UserRoute","UserRoute","UserRoute"]
   * @methodName :["GET","GET","POST","POST","PUT"]
   * @controllerName :["login","logout","register","forgotPassword","editUserProfile"]
   * @dependency :[]
   */
  
  const express = require("express");
  
  const router = express.Router();
          
router.get("/user/login", login);
router.get("/user/logout", logout);
router.post("/user/register", register);
router.post("/user/forgotPassword", forgotPassword);
router.put("/user/editUserProfile", editUserProfile);
  
  module.exports = router;
        