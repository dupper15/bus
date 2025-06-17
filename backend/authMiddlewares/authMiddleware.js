const jwt = require("jsonwebtoken");
const dotenv = require("dotenv");
dotenv.config();

const authMiddleware = (req, res, next) => {
  const token = req.headers.token.split(" ")[1];
  const accountId = req.params.id;
  jwt.verify(token, process.env.ACCESS_TOKEN, function (err, account) {
    if (err) {
      return res.status(401).json({
        status: "ERROR",
        message: "Authentication failed.",
      });
    }
    if (account?.id === accountId) {
      req.account = account;
      next();
    } else {
      return res.status(401).json({
        status: "ERROR",
        message: "Authentication failed.",
      });
    }
  });
};

module.exports = {
  authMiddleware,
};
