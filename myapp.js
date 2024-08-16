const express = require("express");
const app = express();
const sqlite3 = require("sqlite3");
const { open } = require("sqlite");
const path = require("path");
const jwt = require("jsonwebtoken");
const bcrypt = require("bcrypt");
const cors = require("cors");
const multer = require("multer");
const upload = multer({ storage: multer.memoryStorage() });

let db = null;
app.use(express.json());
app.use(cors());

const dbpath = path.join(__dirname,"dataBase.db");
app.use(express.static(path.join(__dirname, 'public')));

const initializeDbandServer = async () =>{

    try{
    db = await open ({
        filename:dbpath,
        driver: sqlite3.Database
    })
    app.listen(3000,()=>{
        console.log("Server Running at http://localhost:3000");
    })
    }
    catch(error){
        console.log(error.message);
    }
}

initializeDbandServer();

//API for posting a new user into t_login

app.post("/register/",async (request,response) => {

    const { username, password } = request.body
    const userExisitsInDB = `SELECT * FROM t_login WHERE f_userName = '${username}';`;
    const user = await db.get(userExisitsInDB);
    const hashedPassword = await bcrypt.hash(password,10);

    if(user === undefined){
        const postingNewUserIntoTable = `INSERT INTO t_login (f_userName,f_Pwd) VALUES ('${username}', '${hashedPassword}');`
        await db.run(postingNewUserIntoTable);
        response.status(200);
        response.send("User created successfully!")
    }
    else{
        response.status(400);
        response.send("User Already Exist.");   
    }
});


// API for login already existig user

app.post("/login/", async (request,response) => {

    const { username, password } = request.body;    
    const userPresntInTable =  `SELECT * FROM t_login WHERE f_userName = '${username}';`;
    const userPresent = await db.get(userPresntInTable);

    if(userPresent === undefined){
        response.status(400);
        response.send("Invalid User")
    }
    else{
        
        const isPasswordValid = await bcrypt.compare(password,userPresent.f_Pwd);
        if(isPasswordValid){
            response.send("Login Successful")
        }
        else{
            response.status(400)
            response.send("Incorrect Password")
        }

    }
});

// API to get all employees
app.get('/employees', async (req, res) => {
    const sqlQuery = 'SELECT * FROM t_Employee;';
    const data = await db.all(sqlQuery);
    res.send(data);
});


// API to insert data into employee

// API to insert data into employee
app.post('/employees', upload.single('f_Image'), async (req, res) => {
    try {
        const { f_Name, f_Email, f_Mobile, f_Designation, f_gender, f_Course } = req.body;
        const f_Image = req.file ? req.file.buffer : null; // Assuming the image is processed as a buffer

        // Check and sanitize input values if necessary
        const insertQuery = `INSERT INTO t_Employee (f_Image, f_Name, f_Email, f_Mobile, f_Designation, f_gender, f_Course) 
                             VALUES (?, ?, ?, ?, ?, ?, ?);`;

        await db.run(insertQuery, [f_Image, f_Name, f_Email, f_Mobile, f_Designation, f_gender, f_Course]);
        res.status(200).send("Employee added to the database successfully");
    } catch (err) {
        console.error("Error adding employee to the database:", err.message);
        res.status(500).send("Error adding employee to the database");
    }
});


// API for deleting the Employee from database 


app.delete("/employees/:Email",async (request,response) =>{
    const deleteQuery = `DELETE FROM t_Employee WHERE f_Email = '${Email}';`;
    await db.run(deleteQuery);
    response.send("Employee Deleted!");
});

