const express = require("express");
const app = express();
const sqlite3 = require("sqlite3");
const { open } = require("sqlite");
const path = require("path");
const cors = require("cors");
const multer = require("multer");
const bcrypt = require("bcrypt");
const upload = multer({ storage: multer.memoryStorage() });

let db = null;
app.use(express.json());
app.use(cors());

// Path to SQLite database
const dbpath = path.join(__dirname, "dataBase.db");
app.use(express.static(path.join(__dirname, 'public')));

// Initialize database and server
const initializeDbandServer = async () => {
    try {
        db = await open({
            filename: dbpath,
            driver: sqlite3.Database
        });

        // Ensure the t_Employee table exists
        await db.exec(`
            CREATE TABLE IF NOT EXISTS t_Employee (
                id INTEGER PRIMARY KEY AUTOINCREMENT,
                f_Image BLOB,
                f_Name TEXT,
                f_Email TEXT,
                f_Mobile TEXT,
                f_Designation TEXT,
                f_gender TEXT,
                f_Course TEXT
            );
        `);

        app.listen(3000, () => {
            console.log("Server Running at http://localhost:3000");
        });
    } catch (error) {
        console.log(error.message);
    }
};

initializeDbandServer();

// Serve the login page
app.get('/', (req, res) => {
    res.sendFile(path.join(__dirname, 'public', 'login.html'));
});

// Register a new user
app.post("/register/", async (request, response) => {
    const { username, password } = request.body;
    const userExistsQuery = `SELECT * FROM t_login WHERE f_userName = ?;`;
    const user = await db.get(userExistsQuery, [username]);
    const hashedPassword = await bcrypt.hash(password, 10);

    if (user === undefined) {
        const insertUserQuery = `INSERT INTO t_login (f_userName, f_Pwd) VALUES (?, ?);`;
        await db.run(insertUserQuery, [username, hashedPassword]);
        response.status(200).send("User created successfully!");
    } else {
        response.status(400).send("User Already Exists.");
    }
});

// Login an existing user
app.post("/login/", async (request, response) => {
    const { username, password } = request.body;
    const userQuery = `SELECT * FROM t_login WHERE f_userName = ?;`;
    const user = await db.get(userQuery, [username]);

    if (user === undefined) {
        response.status(400).send("Invalid User");
    } else {
        const isPasswordValid = await bcrypt.compare(password, user.f_Pwd); // Ensure bcrypt is correctly imported and used
        if (isPasswordValid) {
            response.send("Login successful");
        } else {
            response.status(400).send("Incorrect Password");
        }
    }
});




// Get all employees
app.get('/employees', async (req, res) => {
    try {
        const sqlQuery = 'SELECT * FROM t_Employee;';
        const data = await db.all(sqlQuery);

        // Convert image data to Base64
        const employeesWithImages = data.map(employee => {
            return {
                ...employee,
                f_Image: employee.f_Image ? `data:image/jpeg;base64,${employee.f_Image.toString('base64')}` : null
            };
        });

        res.json(employeesWithImages);
    } catch (error) {
        console.error("Error fetching employees:", error.message);
        res.status(500).send("Error fetching employee data");
    }
});


app.post('/employees', upload.single('f_Image'), async (req, res) => {
    try {
        const { f_Name, f_Email, f_Mobile, f_Designation, f_gender, f_Course } = req.body;
        const f_Image = req.file ? req.file.buffer : null;

        const insertQuery = `INSERT INTO t_Employee (f_Image, f_Name, f_Email, f_Mobile, f_Designation, f_gender, f_Course) 
                             VALUES (?, ?, ?, ?, ?, ?, ?);`;

        await db.run(insertQuery, [f_Image, f_Name, f_Email, f_Mobile, f_Designation, f_gender, f_Course]);
        res.status(200).send("Employee added to the database successfully");
    } catch (err) {
        console.error("Error adding employee to the database:", err.message);
        res.status(500).send("Error adding employee to the database");
    }
});


// Delete an employee by email
app.delete("/employees/:Email", async (request, response) => {
    const { Email } = request.params;
    try {
        const deleteQuery = `DELETE FROM t_Employee WHERE f_Email = ?;`;
        await db.run(deleteQuery, [Email]);
        response.status(200).send("Employee Deleted!");
    } catch (error) {
        console.error("Error deleting employee:", error.message);
        response.status(500).send("Error deleting employee");
    }
});

// Get employee details by email
app.get('/employees/:email', async (req, res) => {
    try {
        const { email } = req.params;
        const sqlQuery = `SELECT * FROM t_Employee WHERE f_Email = ?;`;
        const employee = await db.get(sqlQuery, [email]);

        if (employee) {
            res.json({
                id: employee.id,
                name: employee.f_Name,
                email: employee.f_Email,
                mobile: employee.f_Mobile,
                designation: employee.f_Designation,
                gender: employee.f_gender,
                course: employee.f_Course,
                image: employee.f_Image ? `data:image/jpeg;base64,${employee.f_Image.toString('base64')}` : null
            });
        } else {
            res.status(404).send('Employee not found');
        }
    } catch (err) {
        console.error("Error fetching employee details:", err.message);
        res.status(500).send("Error fetching employee details");
    }
});

// Serve the dashboard page
app.get('/dashboard', (req, res) => {
    res.sendFile(path.join(__dirname, 'public', 'Dashboard.html'));
});

app.get('/employee/:id', async (req, res) => {
    const { id } = req.params;

    try {
        // Use parameterized query to prevent SQL injection
        const query = 'SELECT f_Id, f_Name, f_Email, f_Mobile, f_Designation, f_gender, f_Course FROM t_Employee WHERE f_Id = ?';
        const user = await db.get(query, [id]);

        if (user) {
            res.json(user);
        } else {
            res.status(404).send('Employee not found');
        }
    } catch (err) {
        console.error('Error fetching employee:', err.message);
        res.status(500).send('Error fetching employee');
    }
});





app.put('/employees/id/:id', async (req, res) => {
    const employeeId = req.params.id;
    const { f_Name, f_Mobile, f_Designation, f_gender, f_Course } = req.body;

    // Handle image update separately if needed
    let f_Image = null;
    if (req.file) {
        f_Image = req.file.buffer;
    }

    const sql = `UPDATE t_Employee
                 SET f_Name = ?, f_Mobile = ?, f_Designation = ?, f_gender = ?, f_Course = ?, f_Image = ?
                 WHERE f_Id = ?`;

    try {
        await db.run(sql, [f_Name, f_Mobile, f_Designation, f_gender, f_Course, f_Image, employeeId]);
        res.status(200).json({ message: 'Employee updated successfully' });
    } catch (err) {
        console.error('Error updating employee:', err.message);
        res.status(500).json({ error: err.message });
    }
});
