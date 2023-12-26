const express = require('express');
const mongoose = require('mongoose');
const dotenv = require('dotenv').config();
const bcrypt = require('bcrypt');

const app = express();

const PORT = process.env.PORT;
const MONGO_URL = process.env.MONGO_URL;

mongoose.connect(MONGO_URL);

const userSchema = new mongoose.Schema({
    name : String, 
    email: String, 
    password: String , 
    phone_number: String, 
    department: String
});

const noticeSchema = new mongoose.Schema({
    title: String,
    body: String,
    category: {type: String, enum: ["parking", "covid", "maintenance"]},
    date : {type: Date}
});

const User = mongoose.model('User', userSchema);
const Notice = mongoose.model('Notice', noticeSchema);

app.use(express.json());

app.post('/register', async (req, res) => {
    try{
        const hashP = await bcrypt.hash(req.body.password, 10);
        const user = new User({
            name: req.body.name,
            email: req.body.email,
            password: hashP,
            phone_number: req.body.phone_number,
            department: req.body.department,
        });
        await user.save();
        res.status(200).json({message: "User registered successfully"});
    } catch(error) {
        res.status(500).json({message: "Error"});
    }
})

app.post('/login', async(req, res) => {
    try{
        const user = await User.findOne({email: req.body.email});
        if( !user || !(await bcrypt.compare(req.body.password, user.password)) ) {
            res.status(400).json({message: "User not found"});    
        }
        res.status(200).json({message: "User found successfully", data: user});
    } 
    catch(error) {
        res.status(500).json({message: "Error"});
    }
})

app.post('/notices', async(req, res) => {
    try{
        const notice = new Notice({
            title: req.body.title,
            body: req.body.body,
            category: req.body.category,
            date : req.body.date
        })
        await notice.save();
        res.status(200).json({message: "Notice created successfully"});
    }
    catch(error) {
        res.status(500).json({message: "Error"});
    }
})

app.get('/notices', async(req, res) => {
    try{
        const filterData = req.query.category ? {category: req.query.category} : {};
        const notices = await Notice.find({...filterData});
        res.json(notices);
    } 
    catch(error) {
        res.status(500).json({message: "Error"});
    }
})



app.listen(PORT, () => {
    console.log("Server is running");
})

