
  /**
   * @route :["PaymentsRoute","PaymentsRoute","PaymentRoute"]
   * @methodName :["POST","POST","PATCH"]
   * @controllerName :["paymentCheckoutCreditCard","paymentCheckoutInternetBanking","updatePaymentStatus"]
   * @dependency :[{"name":"PaymentsRoute","value":"/:paymentId","supplier":"PaymentRoute"}]
   */
  
  const express = require("express");
  
  const router = express.Router();
          
router.post("/payments/paymentCheckoutCreditCard", paymentCheckoutCreditCard);
router.post("/payments/paymentCheckoutInternetBanking", paymentCheckoutInternetBanking);
router.patch("/payments/payment/:paymentId/updatePaymentStatus", updatePaymentStatus);
  
  module.exports = router;
        