"use strict";

var _express = _interopRequireDefault(require("express"));
var _index = _interopRequireDefault(require("./routes/index.js"));
function _interopRequireDefault(e) { return e && e.__esModule ? e : { "default": e }; }
var app = (0, _express["default"])();
var PORT = process.env.PORT || 5000;
app.use(_express["default"].json());
app.use('/api', _index["default"]);
app.listen(PORT, function () {
  console.log("Server is running on port ".concat(PORT));
});