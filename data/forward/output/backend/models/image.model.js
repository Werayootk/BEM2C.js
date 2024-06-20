
  
  /**
   * @model :["ImageModel"]
   * @database :["MySQL"]
   * @attribute :[{"name":"imageId","type":"Id"},{"name":"fileName","type":"String"},{"name":"filePath","type":"String"}]
   * @relations :[]
   */
    
  const mongoose = require("mongoose");
  const imageSchema = mongoose.Schema(
    {
      
              imageId: {
                type: Id
              },
                
              fileName: {
                type: String
              },
                
              filePath: {
                type: String
              },
                
    },
    {
      timestamps: true,
    }
  );
  const Image = mongoose.model("Image", imageSchema);
  module.exports = Image;
    