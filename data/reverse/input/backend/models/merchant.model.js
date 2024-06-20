
  
  /**
   * @model :["MerchantModel"]
   * @database :["MySQL"]
   * @attribute :[{"name":"userId","type":"Id"},{"name":"email","type":"String"},{"name":"passWord","type":"String"},{"name":"role","type":"String"},{"name":"firstName","type":"String"},{"name":"lastName","type":"String"},{"name":"phoneNumber","type":"String"},{"name":"resetPasswordToken","type":"String"},{"name":"resetPasswordExpired","type":"String"}]
   * @relations :[]
   */
    
  const mongoose = require("mongoose");
  const merchantSchema = mongoose.Schema(
    {
      
              userId: {
                type: Id
              },
                
              email: {
                type: String
              },
                
              passWord: {
                type: String
              },
                
              role: {
                type: String
              },
                
              firstName: {
                type: String
              },
                
              lastName: {
                type: String
              },
                
              phoneNumber: {
                type: String
              },
                
              resetPasswordToken: {
                type: String
              },
                
              resetPasswordExpired: {
                type: String
              },
                
    },
    {
      timestamps: true,
    }
  );
  const Merchant = mongoose.model("Merchant", merchantSchema);
  module.exports = Merchant;
    