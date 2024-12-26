const jwt = require("jsonwebtoken");
const dotenv = require("dotenv");
dotenv.config();

const generalAccessToken = async (payload) => {
  const access_token = jwt.sign(
    {
      ...payload,
    },
    process.env.ACCESS_TOKEN,
    { expiresIn: "1h" }
  );

  return access_token;
};

const generalRefreshToken = async (payload) => {
  const refresh_token = jwt.sign(
    {
      ...payload,
    },
    process.env.REFRESH_TOKEN,
    { expiresIn: "365d" }
  );

  return refresh_token;
};

const refreshTokenJwt = async (token) => {
  try {
    const account = await new Promise((resolve, reject) => {
      jwt.verify(token, process.env.REFRESH_TOKEN, (err, decoded) => {
        if (err) {
          reject({
            status: "ERROR",
            message: "The authentication",
          });
        } else {
          resolve(decoded);
        }
      });
    });

    const access_token = await generalAccessToken({ id: account?.id });

    return {
      status: "OK",
      message: "SUCCESS",
      access_token,
    };
  } catch (e) {
    return e;
  }
};

module.exports = {
  generalAccessToken,
  generalRefreshToken,
  refreshTokenJwt,
};
