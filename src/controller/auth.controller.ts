import e, { Request, Response } from "express";
import { getRepository, MoreThanOrEqual, SimpleConsoleLogger } from "typeorm";
import { User } from "../entity/user.entity";
import bcryptjs from "bcryptjs";
import { sign, verify } from 'jsonwebtoken';
import { Token } from "../entity/token.entity";


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
            message: "Passwords do not match"
        })
    }

    const { password, ...user } = await getRepository(User).save({
        first_name: body.first_name,
        last_name: body.last_name,
        email: body.email,
        password: await bcryptjs.hash(body.password, 12)
    })

    return res.send(user);
};

export const Login = async (req: Request, res: Response) => {
    const user = await getRepository(User).findOneBy({
        email: req.body.email
    });

    if (!user) {
        return res.status(400).send({
            message: "User not found"
        })
    }

    if (!await bcryptjs.compare(req.body.password, user.password)) {
        return res.status(400).send({
            message: "Password is incorrect"
        });
    }

    if (!(process.env.ACCESS_SECRET && process.env.REFRESH_SECRET)) {
        return res.status(500).send({
            message: "Server error"
        });
    }
    const accessToken = sign({
        id: user.id,
    }, process.env.ACCESS_SECRET, {
        expiresIn: '30s'
    });

    /* res.cookie('access_token', accessToken, {
        httpOnly: true,
        maxAge: 24 * 60 * 60 * 1000 //1 day
    })
 */
    const refreshToken = sign({
        id: user.id,
    }, process.env.REFRESH_SECRET, {
        expiresIn: '1w'
    });

    res.cookie('refresh_token', refreshToken, {
        httpOnly: true, //only the backend will have access to the cookies, adding another layer of security
        maxAge: 7 * 24 * 60 * 60 * 1000,
        sameSite: "none",
        secure:true //one week
    })

    await getRepository(Token).save({
        user_id: user.id,
        token: refreshToken,
        expired_at: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000)
    })


    return res.send({
        accessToken
    });
};


export const AuthenticatedUser = async (req: Request, res: Response) => {
    try {
        const accessToken = req.header('Authorization')?.split(' ')[1] || '';
        //const cookie = req.cookies['access_token'];

        if (!accessToken) {
            return res.status(401).send({
                message: "No access token"
            })
        }

        const payload: any = verify(accessToken, process.env.ACCESS_SECRET ?? '');


        if (!payload) {
            return res.status(401).send({
                message: "Unauthenticated"
            })
        }

        const refreshToken = await getRepository(Token).findOne({
            where: {
                user_id: payload.id,
                expired_at: MoreThanOrEqual(new Date())
            }
        });

        if (!refreshToken) {
            return res.status(401).send({
                message: "Unauthenticated"
            })
        }

        const user = await getRepository(User).findOne({
            where: {
                id: payload.id
            }
        });

        if (!user) {
            return res.status(401).send({
                message: "Unauthenticated"
            })
        }

        const { password, ...userData } = user;

        res.send(userData);
    } catch (error) {
        res.status(401).send({
            message: `"Server error: ${error}"`
        })
    }
};


export const Refresh = async (req: Request, res: Response) => {
    try {


        if (!(process.env.ACCESS_SECRET && process.env.REFRESH_SECRET)) {
            return res.status(500).send({
                message: "Server error"
            });
        }

        const cookie = req.cookies['refresh_token'];
        console.log('cookie', cookie);
        const payload: any = verify(cookie, process.env.REFRESH_SECRET);//TODO add types to payload

        if (!payload) {
            return res.status(401).send({
                message: "Unauthenticated"
            })
        }
        console.log(payload);


        const accessToken = sign({
            id: payload.id,
        }, process.env.ACCESS_SECRET, {
            expiresIn: '30s'
        });


        /* res.cookie('access_token', accessToken, {
            httpOnly: true,
            maxAge: 24 * 60 * 60 * 1000 //1 day
        })
     */
        res.status(200).send({
            accessToken
        });

    } catch (error) {
        res.status(401).send({
            message: `"Server error: ${error}"`
        })
    }
}


export const Logout = async (req: Request, res: Response) => {
    const cookie = req.cookies['refresh_token'];

    await getRepository(Token).delete({
        token: cookie
    });

    res.cookie('refresh_token', '', { maxAge: 0 });

    return res.status(200).send({
        message: 'success'
    });
};