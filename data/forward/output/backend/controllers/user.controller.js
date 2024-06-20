
  /**
   * @controllerName :["login","logout","register","forgotPassword","editUserProfile"]
   * @className :["UserController"]
   */
  
  const asyncHandler = require("express-async-handler");
        
  const login = asyncHandler(async (req, res) => { })

  const logout = asyncHandler(async (req, res) => { })

  const register = asyncHandler(async (req, res) => { })

  const forgotPassword = asyncHandler(async (req, res) => { })

  const editUserProfile = asyncHandler(async (req, res) => { })

  module.exports = {
    login,
logout,
register,
forgotPassword,
editUserProfile,

  };
        