const express = require('express');
const bodyParser = require('body-parser');
const app = express();
app.use(bodyParser.json()) ;


// connect to database
const mysql = require('mysql2');
const database = {
    host: 'localhost',
    user: 'root',
    password: 'your_password',
    database: 'your_database'
};