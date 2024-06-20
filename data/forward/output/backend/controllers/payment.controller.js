
  /**
   * @controllerName :["paymentCheckoutCreditCard","paymentCheckoutInternetBanking","updatePaymentStatus"]
   * @className :["PaymentController"]
   */
  
  const asyncHandler = require("express-async-handler");
        
  const paymentCheckoutCreditCard = asyncHandler(async (req, res) => { })

  const paymentCheckoutInternetBanking = asyncHandler(async (req, res) => { })

  const updatePaymentStatus = asyncHandler(async (req, res) => { })

  module.exports = {
    paymentCheckoutCreditCard,
paymentCheckoutInternetBanking,
updatePaymentStatus,

  };
        