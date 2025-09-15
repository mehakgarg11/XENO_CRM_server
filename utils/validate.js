// server/utils/validate.js
const validate = (schema) => (req, res, next) => {
  const { error, value } = schema.validate(req.body, {
    abortEarly: false,
    stripUnknown: true,
  });
  if (error) {
    return res.status(400).json({
      status: false,
      error: error.details.map(d => d.message).join(", "),
    });
  }
  req.body = value;
  next();
};

module.exports = validate;
