
  /**
   * @route :["CustomersRoute","CustomerRoute","CustomerRoute","CustomerRoute","LocationsRoute","LocationsRoute","LocationRoute","LocationRoute","LocationRoute","CarsRoute","CarsRoute","CarRoute","CarRoute","CarRoute","OrdersRoute","OrderRoute","OrderRoute","BillsRoute","BillRoute","BillRoute"]
   * @methodName :["GET","GET","PUT","DELETE","GET","POST","GET","PUT","DELETE","GET","POST","GET","PUT","DELETE","GET","GET","PUT","GET","GET","PATCH"]
   * @controllerName :["getAllCustomer","getCustomerById","updateCustomerById","deleteCustomerById","getAllLocation","addLocation","getLocationById","updateLocationById","deleteLocationById","getAllCar","addCar","getCarById","updateCarById","deleteCarById","getAllOrder","getOrderById","updateOrderById","getBillAll","getBillById","updateBillById"]
   * @dependency :[{"name":"AdminRoute","value":"/","supplier":"CustomersRoute"},{"name":"AdminRoute","value":"/","supplier":"LocationsRoute"},{"name":"AdminRoute","value":"/","supplier":"CarsRoute"},{"name":"AdminRoute","value":"/","supplier":"OrdersRoute"},{"name":"AdminRoute","value":"/","supplier":"BillsRoute"},{"name":"CustomersRoute","value":"/:customerId","supplier":"CustomerRoute"},{"name":"LocationsRoute","value":"/:location","supplier":"LocationRoute"},{"name":"CarsRoute","value":"/:carId","supplier":"CarRoute"},{"name":"OrdersRoute","value":"/:orderId","supplier":"OrderRoute"},{"name":"BillsRoute","value":"/:billId","supplier":"BillRoute"}]
   */
  
  const express = require("express");
  
  const router = express.Router();
          
router.get("/admin/customers/getAllCustomer", getAllCustomer);
router.get("/admin/customers/customer/:customerId/getCustomerById", getCustomerById);
router.put("/admin/customers/customer/:customerId/updateCustomerById", updateCustomerById);
router.delete("/admin/customers/customer/:customerId/deleteCustomerById", deleteCustomerById);
router.get("/admin/locations/getAllLocation", getAllLocation);
router.post("/admin/locations/addLocation", addLocation);
router.get("/admin/locations/location/:location/getLocationById", getLocationById);
router.put("/admin/locations/location/:location/updateLocationById", updateLocationById);
router.delete("/admin/locations/location/:location/deleteLocationById", deleteLocationById);
router.get("/admin/cars/getAllCar", getAllCar);
router.post("/admin/cars/addCar", addCar);
router.get("/admin/cars/car/:carId/getCarById", getCarById);
router.put("/admin/cars/car/:carId/updateCarById", updateCarById);
router.delete("/admin/cars/car/:carId/deleteCarById", deleteCarById);
router.get("/admin/orders/getAllOrder", getAllOrder);
router.get("/admin/orders/order/:orderId/getOrderById", getOrderById);
router.put("/admin/orders/order/:orderId/updateOrderById", updateOrderById);
router.get("/admin/bills/getBillAll", getBillAll);
router.get("/admin/bills/bill/:billId/getBillById", getBillById);
router.patch("/admin/bills/bill/:billId/updateBillById", updateBillById);
  
  module.exports = router;
        