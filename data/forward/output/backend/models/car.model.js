
  
  /**
   * @model :["CarModel"]
   * @database :["MySQL"]
   * @attribute :[{"name":"carId","type":"Id"},{"name":"carBrand","type":"String"},{"name":"carRegister","type":"String"},{"name":"carPrice","type":"Float"},{"name":"carType","type":"String"},{"name":"carTransmission","type":"String"},{"name":"carSeat","type":"String"},{"name":"carStatus","type":"String"}]
   * @relations :[]
   */
    
  const mongoose = require("mongoose");
  const carSchema = mongoose.Schema(
    {
      
              carId: {
                type: Id
              },
                
              carBrand: {
                type: String
              },
                
              carRegister: {
                type: String
              },
                
              carPrice: {
                type: Float
              },
                
              carType: {
                type: String
              },
                
              carTransmission: {
                type: String
              },
                
              carSeat: {
                type: String
              },
                
              carStatus: {
                type: String
              },
                
    },
    {
      timestamps: true,
    }
  );
  const Car = mongoose.model("Car", carSchema);
  module.exports = Car;
    