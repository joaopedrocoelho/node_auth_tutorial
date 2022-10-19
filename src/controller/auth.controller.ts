import e, { Request, Response } from "express";
import { getRepository, MoreThanOrEqual, SimpleConsoleLogger } from "typeorm";
import { User } from "../entity/user.entity";
import bcryptjs from "bcryptjs";
import { sign, verify } from "jsonwebtoken";
import { Token } from "../entity/token.entity";
import qrcode from "qrcode";
const speakEasy = require("speakeasy");

//TODO: add validations for name, email, password
/* sample request body:  
    {
    "first_name": "a",
    "last_name": "b",
    "email": "joaopedrocoelho2@gmail.com",
    "password": "a",
    "password_confirm": "a1"
}

*/

export const Register = async (req: Request, res: Response) => {
  const body = req.body;

  if (body.password !== body.password_confirm) {
    return res.status(400).send({
      message: "Passwords do not match",
    });
  }

  const { password, tfa_secret, ...user } = await getRepository(User).save({
    first_name: body.first_name,
    last_name: body.last_name,
    email: body.email,
    password: await bcryptjs.hash(body.password, 12),
  });

  return res.send(user);
};

export const Login = async (req: Request, res: Response) => {
  const user = await getRepository(User).findOneBy({
    email: req.body.email,
  });

  if (!user) {
    return res.status(400).send({
      message: "User not found",
    });
  }

  if (!(await bcryptjs.compare(req.body.password, user.password))) {
    return res.status(400).send({
      message: "Password is incorrect",
    });
  }

  if (!(process.env.ACCESS_SECRET && process.env.REFRESH_SECRET)) {
    return res.status(500).send({
      message: "Server error",
    });
  }

  if (user.tfa_secret) {
    return res.send({
      id: user.id,
    });
  }

  const secret = speakEasy.generateSecret({
    name: "My App",
  });

  return res.send({
    id: user.id,
    secret: secret.ascii,
    otpauth_url: secret.otpauth_url,
  });
};

export const QR = async (req: Request, res: Response) => {
  qrcode.toDataURL(
    "otpauth://totp/My%20App?secret=JBSXO6LIPF3EOQCEFJRVM3TRMFEEGNCJF43FUP2MJFPG25BZEYXA",
    (err, data) => {
      return res.send(`<img src="${data}" />`);
    }
  );
};

export const TwoFactor = async (req: Request, res: Response) => {
  try {
    const id = req.body.id;

    const repository = getRepository(User);


    const user = await repository.findOneBy({
        id
    });


    if (!user) {
      return res.status(400).send({
        message: "Invalid credentials",
      });
    }

    const secret = user.tfa_secret !== '' ? user.tfa_secret : req.body.secret;

    const verified = speakEasy.totp.verify({
        secret,
        enconding: 'ascii',
        token:req.body.code
    });


    if(!verified) {
        return res.status(400).send({
            message: "Invalid code"
        })
    }

    if( user.tfa_secret === '') {
        await repository.update(id, {
            tfa_secret: secret
        });
    }

    if (!(process.env.ACCESS_SECRET && process.env.REFRESH_SECRET)) {
      return res.status(500).send({
        message: "Server error",
      });
    }

    const accessToken = sign(
      {
        id: id,
      },
      process.env.ACCESS_SECRET,
      {
        expiresIn: "30s",
      }
    );

    const refreshToken = sign(
      {
        id: id,
      },
      process.env.REFRESH_SECRET,
      {
        expiresIn: "1w",
      }
    );

    res.cookie("refresh_token", refreshToken, {
      httpOnly: true, //only the backend will have access to the cookies, adding another layer of security
      maxAge: 7 * 24 * 60 * 60 * 1000,
      sameSite: "none",
      secure: true, //one week
    });

    await getRepository(Token).save({
      user_id: id,
      token: refreshToken,
      expired_at: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000),
    });

    return res.send({
      accessToken,
    });
  } catch (e) {
    return res.status(401).send({
      message: "Unauthenticated",
    });
  }
};

export const AuthenticatedUser = async (req: Request, res: Response) => {
  try {
    const accessToken = req.header("Authorization")?.split(" ")[1] || "";
    //const cookie = req.cookies['access_token'];

    if (!accessToken) {
      return res.status(401).send({
        message: "No access token",
      });
    }

    const payload: any = verify(accessToken, process.env.ACCESS_SECRET ?? "");

    if (!payload) {
      return res.status(401).send({
        message: "Unauthenticated",
      });
    }

    const refreshToken = await getRepository(Token).findOne({
      where: {
        user_id: payload.id,
        expired_at: MoreThanOrEqual(new Date()),
      },
    });

    if (!refreshToken) {
      return res.status(401).send({
        message: "Unauthenticated",
      });
    }

    const user = await getRepository(User).findOne({
      where: {
        id: payload.id,
      },
    });

    if (!user) {
      return res.status(401).send({
        message: "Unauthenticated",
      });
    }

    const { password, tfa_secret, ...userData } = user;

    res.send(userData);
  } catch (error) {
    res.status(401).send({
      message: `"Server error: ${error}"`,
    });
  }
};

export const Refresh = async (req: Request, res: Response) => {
  try {
    if (!(process.env.ACCESS_SECRET && process.env.REFRESH_SECRET)) {
      return res.status(500).send({
        message: "Server error",
      });
    }

    const cookie = req.cookies["refresh_token"];
    const payload: any = verify(cookie, process.env.REFRESH_SECRET); //TODO add types to payload

    if (!payload) {
      return res.status(401).send({
        message: "Unauthenticated",
      });
    }
    console.log(payload);

    const accessToken = sign(
      {
        id: payload.id,
      },
      process.env.ACCESS_SECRET,
      {
        expiresIn: "30s",
      }
    );

    /* res.cookie('access_token', accessToken, {
            httpOnly: true,
            maxAge: 24 * 60 * 60 * 1000 //1 day
        })
     */
    res.status(200).send({
      accessToken,
    });
  } catch (error) {
    res.status(401).send({
      message: `"Server error: ${error}"`,
    });
  }
};

export const Logout = async (req: Request, res: Response) => {
  const cookie = req.cookies["refresh_token"];

  await getRepository(Token).delete({
    token: cookie,
  });

  res.cookie("refresh_token", "", { maxAge: 0 });

  return res.status(200).send({
    message: "success",
  });
};
