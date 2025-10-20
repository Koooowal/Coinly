import mysql from 'mysql2';
import dotenv from 'dotenv';

dotenv.config();

export const db = mysql.createConnection({
  host: process.env.DB_HOST,
  user: process.env.DB_USER,
  password: process.env.DB_PASS,
  database: process.env.DB_DB,
  port: process.env.DB_PORT
});

db.connect(err => {
  if (err) {
    console.error('Error connecting to MySQL:', err);
    console.log('Please make sure MySQL server is running and the database exists');
  } else {
    console.log('Connected to MySQL database successfully');
  }
});