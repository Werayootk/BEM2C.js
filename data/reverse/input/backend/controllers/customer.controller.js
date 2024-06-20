
  /**
   * @controllerName :["Operation1","Operation2","Operation3","Operation4"]
   * @className :["CustomerController"]
   */
  
  const asyncHandler = require("express-async-handler");
        
  const Operation1 = asyncHandler(async (req, res) => { })

  const Operation2 = asyncHandler(async (req, res) => { })

  const Operation3 = asyncHandler(async (req, res) => { })

  const Operation4 = asyncHandler(async (req, res) => { })

  module.exports = {
    Operation1,
Operation2,
Operation3,
Operation4,

  };
        