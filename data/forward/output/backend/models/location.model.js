
  
  /**
   * @model :["locationModel"]
   * @database :["MySQL"]
   * @attribute :[{"name":"locationId","type":"Id"},{"name":"province","type":"String"},{"name":"location","type":"String"}]
   * @relations :[]
   */
    
  const mongoose = require("mongoose");
  const locationSchema = mongoose.Schema(
    {
      
              locationId: {
                type: Id
              },
                
              province: {
                type: String
              },
                
              location: {
                type: String
              },
                
    },
    {
      timestamps: true,
    }
  );
  const location = mongoose.model("location", locationSchema);
  module.exports = location;
    