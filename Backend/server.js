import dotenv from 'dotenv';
import cors from 'cors';
import express from 'express';
import { db } from './db.js';

dotenv.config({quiet: true});

const app = express();
app.use(express.json());
app.use(cors({
    origin: process.env.CLIENT_URL,
    methods: ['GET', 'POST', 'PUT', 'DELETE'],
    credentials: true
}));

const PORT = process.env.PORT || 3000;

app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});