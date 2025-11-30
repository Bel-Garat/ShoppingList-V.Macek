function auth(req, res, next) {
  const profileHeader = req.header("x-user-profile");

  if (!profileHeader) {
    return res.status(401).json({
      errorCode: "unauthorized",
      message: "Missing x-user-profile header."
    });
  }

  const profile = String(profileHeader).toLowerCase();

  if (!["user", "owner", "member"].includes(profile)) {
    return res.status(400).json({
      errorCode: "invalidProfile",
      message: "x-user-profile must be one of: user, owner, member."
    });
  }
   
  const mockUserId = "user-123";

  req.user = {
    id: mockUserId,
    profile
  };

  next();
}

function requireProfiles(allowedProfiles) {
  return function (req, res, next) {
    if (!req.user || !allowedProfiles.includes(req.user.profile)) {
      return res.status(403).json({
        errorCode: "forbidden",
        message: "You are not allowed to call this endpoint."
      });
    }
    next();
  };
}

module.exports = {
  auth,
  requireProfiles
};