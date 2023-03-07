const router = require("express").Router();
const jwt = require("jsonwebtoken");
const User = require("../users/users-model");
const { usernameVarmi, rolAdiGecerlimi } = require("./auth-middleware");
const { JWT_SECRET } = require("../secrets"); // bu secret'ı kullanın!

router.post("/register", rolAdiGecerlimi, async (req, res, next) => {
  req.body.role_name = req.role_name;
  console.log(req.body);

  const data = await User.ekle(req.body);
  return res.status(200).json(data);
  /**
    [POST] /api/auth/register { "username": "anna", "password": "1234", "role_name": "angel" }

    response:
    status: 201
    {
      "user"_id: 3,
      "username": "anna",
      "role_name": "angel"
    }
   */
});

router.post("/login", usernameVarmi, (req, res, next) => {
  const { password } = req.body;
  if (password === req.user.password) {
    const token = jwt.sign(
      {
        subject: req.user.user_id,
        username: req.user.username,
        role_name: req.user.role_name,
      },
      JWT_SECRET,
      {
        expiresIn: "1d",
      }
    );
    return res.status(200).json({
      message: `${req.user.username} geri geldi!`,
      token,
    });
  }
  else {
    return res.status(401)
  }
  /**
    [POST] /api/auth/login { "username": "sue", "password": "1234" }

    response:
    status: 200
    {
      "message": "sue geri geldi!",
      "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.ETC.ETC"
    }

    Token 1 gün sonra timeout olmalıdır ve aşağıdaki bilgiyi payloadında içermelidir:

    {
      "subject"  : 1       // giriş yapan kullanıcının user_id'si
      "username" : "bob"   // giriş yapan kullanıcının username'i
      "role_name": "admin" // giriş yapan kulanıcının role adı
    }
   */
});

module.exports = router;
