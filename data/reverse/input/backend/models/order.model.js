
  
  /**
   * @model :["OrderModel"]
   * @database :["MySQL"]
   * @attribute :[{"name":"orderId","type":"Id"},{"name":"orderStatus","type":"String"},{"name":"refund","type":"String"},{"name":"returnLocation","type":"String"},{"name":"pickupLocation","type":"String"},{"name":"bookingNo","type":"String"},{"name":"startDateTime","type":"Date"},{"name":"endDateTime","type":"Date"}]
   * @relations :[]
   */
    
  const mongoose = require("mongoose");
  const orderSchema = mongoose.Schema(
    {
      
              orderId: {
                type: Id
              },
                
              orderStatus: {
                type: String
              },
                
              refund: {
                type: String
              },
                
              returnLocation: {
                type: String
              },
                
              pickupLocation: {
                type: String
              },
                
              bookingNo: {
                type: String
              },
                
              startDateTime: {
                type: Date
              },
                
              endDateTime: {
                type: Date
              },
                
    },
    {
      timestamps: true,
    }
  );
  const Order = mongoose.model("Order", orderSchema);
  module.exports = Order;
    