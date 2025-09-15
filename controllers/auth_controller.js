const jwt = require("jsonwebtoken");

function signToken(user) {
  return jwt.sign(
    { id: user._id, email: user.email, name: user.name },
    process.env.JWT_SECRET,
    { expiresIn: "7d" }
  );
}

exports.signup = async (req, res) => {  };
exports.login  = async (req, res)  => { };


exports.googleCallback = (req, res) => {
  const token = signToken(req.user);
 
  const redirectUrl = `${process.env.CLIENT_URL}/auth/google/callback?token=${token}`;
  return res.redirect(redirectUrl);
};
