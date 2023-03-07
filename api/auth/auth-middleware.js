const { JWT_SECRET } = require("../secrets"); // bu secreti kullanın!
const User = require("../users/users-model");
const jwt = require("jsonwebtoken");

const sinirli = (req, res, next) => {
  const token = req.headers["authorization"];
  if (!token) {
    return res.status(401).json({
      message: "Token gereklidir",
    });
  }
  jwt.verify(token, JWT_SECRET, function (err, decoded) {
    if (err) {
      return res.status(401).json({
        message: "Token gecersizdir",
      });
    } else {
      req.user = decoded;
      next();
    }
  });
  /*
    Eğer Authorization header'ında bir token sağlanmamışsa:
    status: 401
    {
      "message": "Token gereklidir"
    }

    Eğer token doğrulanamıyorsa:
    status: 401
    {
      "message": "Token gecersizdir"
    }

    Alt akıştaki middlewarelar için hayatı kolaylaştırmak için kodu çözülmüş tokeni req nesnesine koyun!
  */
};

const sadece = (role_name) => (req, res, next) => {
  ;
  if (req.user.role_name === role_name) {
    next();
  } else {
    return res.status(403).json({
      message: "Bu, senin için değil",
    });
  }
  /*
    
	Kullanıcı, Authorization headerında, kendi payloadu içinde bu fonksiyona bağımsız değişken olarak iletilen 
	rol_adı ile eşleşen bir role_name ile bir token sağlamazsa:
    status: 403
    {
      "message": "Bu, senin için değil"
    }

    Tekrar authorize etmekten kaçınmak için kodu çözülmüş tokeni req nesnesinden çekin!
  */
};

const usernameVarmi = async (req, res, next) => {
  const { username } = req.body;
  const data = await User.goreBul({ username });
  if (data) {
    req.user = data;
    next();
  } else {
    return res.status(401).json({
      message: "Geçersiz kriter",
    });
  }
  /*
    req.body de verilen username veritabanında yoksa
    status: 401
    {
      "message": "Geçersiz kriter"
    }
  */
};

const rolAdiGecerlimi = (req, res, next) => {
  const { role_name } = req.body;
  let result;
  if (role_name) {
    result = role_name.trim();
  }
  if (!role_name || result === "") {
    result = "student";
  }
  if (role_name === "admin") {
    return res.status(422).json({
      message: "Rol adı admin olamaz",
    });
  }
  if (role_name.length > 32) {
    return res.status(422).json({
      message: "rol adı 32 karakterden fazla olamaz",
    });
  }
  req.role_name = result;
  next();

  /*
    Bodydeki role_name geçerliyse, req.role_name öğesini trimleyin ve devam edin.

    Req.body'de role_name eksikse veya trimden sonra sadece boş bir string kaldıysa,
    req.role_name öğesini "student" olarak ayarlayın ve isteğin devam etmesine izin verin.

    Stringi trimledikten sonra kalan role_name 'admin' ise:
    status: 422
    {
      "message": "Rol adı admin olamaz"
    }

    Trimden sonra rol adı 32 karakterden fazlaysa:
    status: 422
    {
      "message": "rol adı 32 karakterden fazla olamaz"
    }
  */
};

module.exports = {
  sinirli,
  usernameVarmi,
  rolAdiGecerlimi,
  sadece,
};
