
  
  /**
   * @model :["BillModel"]
   * @database :["MySQL"]
   * @attribute :[{"name":"billId","type":"Id"},{"name":"billDate","type":"Date"},{"name":"paidDate","type":"Date"},{"name":"billStatus","type":"String"},{"name":"amount","type":"Integer"},{"name":"totalAmount","type":"Integer"}]
   * @relations :[]
   */
    
  const mongoose = require("mongoose");
  const billSchema = mongoose.Schema(
    {
      
              billId: {
                type: Id
              },
                
              billDate: {
                type: Date
              },
                
              paidDate: {
                type: Date
              },
                
              billStatus: {
                type: String
              },
                
              amount: {
                type: Integer
              },
                
              totalAmount: {
                type: Integer
              },
                
    },
    {
      timestamps: true,
    }
  );
  const Bill = mongoose.model("Bill", billSchema);
  module.exports = Bill;
    