import 'dotenv/config';

import express from 'express';
import { createConnection } from 'typeorm';
import { routes } from './routes';
import cors from 'cors';
import cookieParser from 'cookie-parser';

createConnection().then(() => {
    const app = express();

    app.use(express.json());
    app.use(cookieParser());
    app.use(cors({
        origin: ['http://localhost:3000','http://127.0.0.1:5173'],
        credentials: true // this will allow cookies to be sent accross domains
    }))

    routes(app);

    app.listen(8000, () => {
        console.log('Server is running on port 8000');
    });

    
    app.post('/test', (req, res) => {
        res.send(req.body);
    })
})



