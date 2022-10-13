import { Request, Response } from "express";
import { createTransport } from "nodemailer";
import dns from 'node:dns';
dns.setDefaultResultOrder('ipv4first');

import { getRepository } from "typeorm";
import { Reset } from "../entity/reset.entity";
import { User } from "../entity/user.entity";
import bcryptjs from "bcryptjs";


export const ForgotPassword = async (req: Request, res: Response) => {
    //TODO: add validations for email

    const { email } = req.body;

    const token = Math.random().toString(20).substring(2, 12);


    const reset = await getRepository(Reset).save({
        email,
        token
    });

    const transporter = createTransport({
        host: '0.0.0.0',
        port: 1025,
    });

    const url = `http://localhost:5173/#/reset/${token}`;

    await transporter.sendMail({
        from:'from@example.com',
        to: email,
        subject: 'Reset Password',
        html:`<p>Click <a href="${url}">here</a> to reset your password</p>`
    })

    res.status(200).send({
        message: "Please check your email"
    });
};

export const ResetPassword = async (req: Request, res: Response) => {
    const { token, password, password_confirm } = req.body;

    if(password !== password_confirm) {
        return res.status(400).send({
            message: "Passwords do not match"
        })
    }

    const resetPassword = await getRepository(Reset).findOne({
        where: {
            token
        }
    });

    if(!resetPassword) {
        return res.status(400).send({
            message: "Invalid token"
        })
    }

    const user = await getRepository(User).findOne({
        where: {
            email: resetPassword.email
        }    
    });

    if(!user) {
        return res.status(400).send({
            message: "User not found"
        })
    }

    await getRepository(User).update(user.id, {
        password: await bcryptjs.hash(password, 12)
    });

    res.send({
        message: "Password reset successfully"
    });     

}