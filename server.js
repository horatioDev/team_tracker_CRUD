// Create server for browser use w/ express
const express = require('express');
const bodyParser = require('body-parser');
const path = require('path');
const app = express();
const PORT = process.env.PORT || 3000;
const MongoClient = require('mongodb').MongoClient;
const ObjectId = require('mongodb').ObjectId;
const password = require('./password.js');
const PASSWORD = password.getPassword();
const CONNECTION_STRING = `mongodb+srv://employees:${PASSWORD}@employees-cluster.lex1ez3.mongodb.net/?retryWrites=true&w=majority`;

// Create Database Client Connection 
MongoClient.connect(CONNECTION_STRING)
  .then(client => {
    console.log('Connected to MongoDB Server')
    const db = client.db("employeesDB");
    const employeesCollection = db.collection('employees');

    // we need to set view engine to ejs. This tells Express we’re using EJS as the template engine
    app.set('view engine', 'ejs');

    // Body Parser -----------------------------------------------------------
    /*
    Body-parser: is a middleware that helps express handle reading data from the <form> element.
    npm install body-parser --save
    
    They help tidy up request objects before use w/ use method:
    app.use(bodyParser.urlencoded({extended: true}))
    
    urlencoded: method within body-parser tells body-parser to extract data from the <form> element and add them to the body property in the request object:
    { inputName: inputValue }
    
    Make sure you place body-parser before your CRUD handlers!
    app.get()
    app.post()
    app.put()
    app.delete()
    */
    app.use(bodyParser.urlencoded({ extended: true }));
    // Read JSON --------------------------------------------------------------
    app.use(bodyParser.json());
    //  Serve Static Files ----------------------------------------------------
    app.use(express.static('public'));

    // ----------------------------------------------------------------------------

    // Create ---------------------------------------------------------------------
    /*
    Browsers can only perform a Create operation if they send a POST request:
    app.post(endpoint, callback);
    
    To the server though a <form> or javascript.
    
    To send a POST request the index.html needs a <form> element.
    The form should have an action, method attribute and a name attribute on each input element:
    action: tells the browser where to send the request: /endpoint
    method: tells the browser what kind of request to send: POST
    name: Descriptive name
    
    We can handle this POST request with a post method in server.js. The path should be the value you placed in the action attribute.
    app.post('/path', (req, res) => { handle post req});
    
    See: Body-parser
    */

    // POST route for adding a new employee
    app.post('/employees', (req, res) => {
      // Log the request body
      console.log('rb', req.body);

      // Add the received employee to the database collection
      employeesCollection.insertOne(req.body)
        .then(result => {
          // Redirect the browser to the home page after successfully adding the employee
          res.redirect('/');
        })
        .catch(err => {
          // Log any errors to the console
          console.error(err);
        });
    });

    // API:---------------------
    app.post('/api', (req, res) => {
      // Log the request body
      console.log('rb', req.body);

      // Add the received employee to the database collection
      employeesCollection.insertOne(req.body)
        .then(result => {
          // Send back the inserted document as JSON
          res.json(req.body);
          console.log('rb2', result, req.body)
          // Redirect the browser to the home page after successfully adding the employee
        })
        .catch(err => {
          // Log any errors to the console
          console.error(err);
        });
    });
    // ---------------------------

    // ----------------------------------------------------------------------------

    // Read -----------------------------------------------------------------------
    /*
    We handle GET request w/ get method:
    app.get(endpoint, callback);
    
    domain_name: www.website.com/dir/file/
    endpoint: is anything after domain_name (/dir/file/)
    callback: tells the server what to do when the requested endpoint  matches the endpoint in the route.
    
    It takes (req, res) as parameters where req is the HTTP request and res is the  HTTP response.
    
    app.get('/', (req, res) => {handle get req})
    */

    // Home page route
    app.get('/', (req, res) => {

      // Retrieve employees from the database
      employeesCollection.find()
        .toArray() // Convert MongoDB cursor to array
        .then(results => {
          // Render the home page with the retrieved employees
          res.render('index', { employees: results });

          // Alternative approach: Determine the response format based on the request accept header
          // if (req.accepts('html')) {
          //   res.status(200).render('index.ejs', { employees: results });
          // } else {
          //   res.status(200).json({ employees: results });
          // }
        })
        .catch(err => {
          // Log any errors to the console
          console.error(err);
          // Send a 500 response for any internal server errors
          res.status(500).send('Internal Server Error');
        });
    });

    // API: Route to retrieve all employees as JSON
    app.get('/api/employees', (req, res) => {
      // Retrieve all employees from the database
      employeesCollection.find()
        .toArray() // Convert MongoDB cursor to array
        .then(results => {
          // Check if there are any employees found
          (!results) ?
            // Send a 404 response if no employees are found
            res.status(404).json({
              message: 'No entries found.',
              results // Include an empty results array in the response
            })
            :
            // Send a successful response with the employees as JSON
            res.status(200).json(results);

        })
        .catch(err => {
          // Log any errors to the console
          console.error(err);
          // Send a 500 response for any internal server errors
          res.status(500).send('Internal Server Error');
        });
    });
    // ------------------------

    // API: Route to retrieve all employees by ID as JSON
    app.get('/api/employees/:id', (req, res) => {
      // Extract the employee ID from the request parameters
      let employeeId = req.params.id;

      // Define the query to find the employee by its ID
      let employeeQuery = { _id: new ObjectId(employeeId) };

      // Use findOne to find the employee in the database
      employeesCollection.findOne(employeeQuery)
        .then((result) => {

          // Check if the employee is not found
          if (!result) {
            // If employee is not found, send a 404 status with a JSON response
            return res.status(404).json({ message: `Cannot find employee with ID ${employeeId}` });
          } else {
            // If the employee is found, send a 200 status with a JSON response containing the employee
            res.status(200).json(result);
          }
        })
        .catch((err) => {
          // Log any errors to the console and send a 500 status with a JSON response indicating internal server error
          console.log(err);
          res.status(500).json({ error: 'Internal Server Error' });
        });
    });
    // ------------------------

    // GET route for retrieving all employees
    app.get('/employees', (req, res) => {
      // Retrieve all employees from the database collection
      employeesCollection.find()
        .toArray()
        .then(results => {
          // Log the results to the console
          console.log(results);

          // Check if there are no results
          if (!results) {
            // If no results found, send a 404 status with a JSON response
            return res.status(404).json({ message: 'No Results' });
          } else {
            // If results found, send a 200 status with a JSON response containing the results
            res.status(200).json(results);
          }
        })
        .catch(err => {
          // Log any errors to the console and send a 500 status with a JSON response containing the error
          console.error(err);
          res.status(500).json({ error: err })
        })
    });


    // Route to retrieve all employees by ID
    app.get('/employees/:id', (req, res) => {
      // Extract the employee ID from the request parameters
      let employeeId = req.params.id;

      // Define the query to find the employee by its ID
      let employeeQuery = { _id: new ObjectId(employeeId) };

      // Use findOne to find the employee in the database
      employeesCollection.findOne(employeeQuery)
        .then((result) => {
          // Log the result to the console
          // console.log('r', result);

          // Check if the employee is not found
          if (!result) {
            // If employee is not found, send a 404 status with a JSON response
            return res.status(404).json({ message: `Cannot find employee with ID ${employeeId}` });
          } else {
            // If the employee is found, send a 200 status with a JSON response containing the employee
            res.status(200).json(result);
          }
        })
        .catch((err) => {
          // Log any errors to the console and send a 500 status with a JSON response indicating internal server error
          console.log(err);
          res.status(500).json({ error: 'Internal Server Error' });
        });
    });

    // Route to retrieve all employees by ID
    app.get('/api/employees/:id', (req, res) => {
      // Extract the employee ID from the request parameters
      let employeeId = req.params.id;

      // Define the query to find the employee by its ID
      let employeeQuery = { _id: new ObjectId(employeeId) };

      // Use findOne to find the employee in the database
      employeesCollection.findOne(employeeQuery)
        .then((result) => {
          // Log the result to the console
          // console.log('r', result);

          // Check if the employee is not found
          if (!result) {
            // If employee is not found, send a 404 status with a JSON response
            return res.status(404).json({ message: `Cannot find employee with ID ${employeeId}` });
          } else {
            // If the employee is found, send a 200 status with a JSON response containing the employee
            res.status(200).json(result);
          }
        })
        .catch((err) => {
          // Log any errors to the console and send a 500 status with a JSON response indicating internal server error
          console.log(err);
          res.status(500).json({ error: 'Internal Server Error' });
        });
    });


    // GET route for editing a specific employee
    app.get('/employees/:id/edit', (req, res) => {
      // Extract the employee ID from the request parameters
      let employeeId = req.params.id;

      // Define the query to find the employee by its ID
      let employeeQuery = { _id: new ObjectId(employeeId) };

      // Log the employee ID to the console
      console.log(employeeId);

      // Use findOne to find the employee in the database
      employeesCollection.findOne(employeeQuery)
        .then((result) => {
          // Log the result to the console
          console.log('r', result);

          // Check if the employee is not found
          if (!result) {
            // If employee is not found, send a 404 status with a JSON response and redirect to the home page
            return res.status(404).json({ message: `Cannot find employee with ID ${employeeId}` }).redirect("/");
          } else {
            // If the employee is found

            // Check if the request's accept header indicates JSON format
            const acceptHeader = req.headers['accept'];
            if (acceptHeader && acceptHeader.includes('application/json')) {
              // If JSON format is requested, send a 200 status with a JSON response containing the employee
              return res.status(200).json(result);
            } else {
              // If HTML format is requested, render the edit-employee.ejs template with the employee data
              res.render("edit-employee.ejs", { employee: result });
            }
          }
        })
        .catch((err) => {
          // Log any errors to the console and send a 500 status with a JSON response indicating internal server error
          console.log(err);
          res.status(500).send('Internal Server Error');
        });
    });

    // API: GET route for editing a specific employee in API format
    app.get('/api/employees/:id/edit', (req, res) => {
      // Extract the employee ID from the request parameters
      let employeeId = req.params.id;

      // Define the query to find the employee by its ID
      let employeeQuery = { _id: new ObjectId(employeeId) };

      // Use findOne to find the employee in the database
      employeesCollection.findOne(employeeQuery)
        .then((result) => {

          // Check if the employee is not found
          if (!result) {
            // If employee is not found, send a 404 status with a JSON response
            return res.status(404).json({ message: `Cannot find employee with ID ${employeeId}` });
          } else {
            // If the employee is found, send a 200 status with a JSON response containing the employee
            res.status(200).json(result);
          }
        })
        .catch((err) => {
          // Log any errors to the console and send a 500 status with a JSON response indicating internal server error
          console.log(err);
          res.status(500).json({ error: 'Internal Server Error' });
        });
    });
    // ------------------------

    // ----------------------------------------------------------------------------

    // Update -----------------------------------------------------------------
    app.put('/employees/:id', (req, res) => {
      const employeeId = req.params.id;
      const employeeQuery = { _id: new ObjectId(employeeId) };
      const employeeData = req.body;
      console.log('Updated Employee Data:', employeeData);


      employeesCollection.findOneAndUpdate(employeeQuery, { $set: employeeData }, { upsert: true, returnOriginal: false })
        .then((result) => {
          console.log("updateResult", employeeData);
          // res.send({employeeData})
          result = Object.assign({}, employeeQuery, employeeData);
          if (!result) {
            return res.status(404).json({ message: `Cannot update employee with ID ${employeeId}` });
          } else {
            return res.status(200).json(result);
          }
        })
        .catch((e) => {
          console.error(`Error updating employee ${employeeId}`, e);
          res.status(500).send('Server error');
        });

    });

    // API: PUT route handler that is called when the /api/employees/:id endpoint is hit 
    app.put('/api/employees/:id', (req, res) => {
      const employeeId = req.params.id;
      const employeeQuery = { _id: new ObjectId(employeeId) };
      const employeeData = req.body;
      console.log('Updated Employee Data:', employeeData);


      employeesCollection.findOneAndUpdate(employeeQuery, { $set: employeeData }, { upsert: true, returnOriginal: false })
        .then((result) => {
          console.log("updateResult",);
          // res.send({employeeData})
          result = Object.assign({}, employeeQuery, employeeData);
          if (!result) {
            return res.status(404).json({ message: `Cannot update employee with ID ${employeeId}` });
          } else {
            return res.status(200).json(result);
          }
        })
        .catch((e) => {
          console.error(`Error updating employee ${employeeId}`, e);
          res.status(500).send('Server error');
        });

    });
    // ------------------------


    // ----------------------------------------------------------------------------

    // Delete ---------------------------------------------------------------------
    app.delete('/employees/:id/delete', (req, res) => {
      console.log('DRR:', req.body)
      const employeeId = req.params.id;
      const employeeQuery = { _id: new ObjectId(employeeId) };
      const employeeData = req.body;
      console.log('Delete Employee Data:', employeeData);

      employeesCollection.deleteOne(employeeQuery, employeeData)
        .then(result => {
          console.log('Delete Employee Data:', employeeData);
          console.log('dr', { ...result })
          if (result.deletedCount === 0) {
            res.json({ message: 'No record of that employee was found.' });
          } else {
            console.log('Deleted', result, employeeData);
            res.status(200).json(result)
          }
        })
        .catch((e) => {
          console.error(`Error deleting employee ${employeeId}`, e);
          res.status(500).send('Server error');
        });
    });


    app.delete('/api/employees/:id/delete', (req, res) => {
      console.log('DRR:', req.body)
      const employeeId = req.params.id;
      const employeeQuery = { _id: new ObjectId(employeeId) };
      const employeeData = req.body;
      console.log('Delete Employee Data:', employeeData);

      employeesCollection.deleteOne(employeeQuery, employeeData)
        .then(result => {
          console.log('Delete Employee Data:', employeeData);
          console.log('dr', { ...result })
          if (result.deletedCount === 0) {
            res.json({ message: 'No record of that employee was found.' });
          } else {
            console.log('Deleted', result, employeeData);
            res.status(200).json(result)
          }
        })
        .catch((e) => {
          console.error(`Error deleting employee ${employeeId}`, e);
          res.status(500).send('Server error');
        });
    });
    // ----------------------------------------------------------------------------

    // Listen for server on port localhost:3000
    app.listen(PORT, function () {
      console.log(`Listening on localhost:${PORT}`)
    });
  })
  .catch(error => console.error(error));

// Run server
// cd working_dir && node server.js
// ----------------------------------------------------------------------------

// Nodemon --------------------------------------------------------------------
/*
Nodemon: restarts the server automatically when you save a file that’s used by the server.js. 
npm install nodemon --save-dev

Update script in package.json
"scripts": {
  "dev": "nodemon server.js"
}

npm run dev to trigger nodemon server.js
*/

// ----------------------------------------------------------------------------

// Test server
console.log('Team Tracker:  Create, Read, Update & Delete');