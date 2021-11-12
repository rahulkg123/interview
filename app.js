require("dotenv").config({ path: 'process.env' });
//const mysqlModel = require('mysql-model');
//var User= require("./config/database").connect();
const express = require("express");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");

//const User = require("./model/user");
const auth = require("./middleware/auth");

const app = express();
var mysql = require('mysql');

var User = mysql.createConnection({
  host     : 'localhost',
  user     : 'root',
  password : '',
  database : 'my_db',
});
User.connect();

app.use(express.json({ limit: "50mb" }));

app.post("/register", async (req, res) => {
  try {
    // Get user input
    const { first_name, last_name, email, password } = req.body;

    // Validate user input
    if (!(email && password && first_name && last_name)) {
      res.status(400).send("All input is required");
    }
    
    // check if user already exist
    // Validate if user exist in our database
    //const oldUser = await User.findOne({ email });
    User.query('SELECT email from users where email="'+email+'"', function (error, results, fields) {
  if (error) throw error;
  //var chk_str=JSON.stringify(results);
 // var chk_arr=JSON.parse(chk_str);
  //console.log(results.length);
  if (results.length > 0) {
    console.log(results);
    return  res.status(409).send("User Already Exist. Please Login");
    }else{
        const user = {
        first_name,
        last_name,
        email: email,
        password: password,
        role:2,
      };
      var post  = {first_name: first_name,last_name:last_name,email:email,password:password,role:2};
      
      var query = User.query('INSERT INTO users SET ?', post, function (error, rows, fields) {
      if (error) throw error;
      if(rows)
      {
      // console.log(results);
        var insertId=rows.insertId;
         const token = jwt.sign(
          { user_id: insertId, email },
          process.env.TOKEN_KEY,
          {
            expiresIn: "2h",
          }
        );
        // save user token
        user.token = token;
        //var cond = [token,insertId];
        console.log('UPDATE users SET token= "'+token+'" WHERE user_id = "'+insertId+'"');
        User.query('UPDATE users SET token= "'+token+'" WHERE user_id = "'+insertId+'"', function (error, updrows, fields) {
          if (error) throw error;
          if(updrows)
          {
            res.status(201).json(user);
          }
        });
        // return new user
        //res.status(201).json(user);
        //return res.status(201).send("Registered successfully");
      }
      // Neat!
      });

      // Create token
     
    }
  //console.log('The solution is: ', results[0].solution);
});
   // const oldUser = await User.find({ email });
    

    //Encrypt user password
    //encryptedPassword = await bcrypt.hash(password, 10);

    // Create user in our database
    //const user = await User.create({
    /*const user = await User.save({
      first_name,
      last_name,
      email: email,//.toLowerCase(), // sanitize: convert email to lowercase
      password: password,
    });*/
   
  } catch (err) {
    console.log(err);
  }
});
app.post("/category", async (req, res) => {
  try {
    // Get user input
    const { category_name, user_id } = req.body;
    // Validate user input
    if (!(category_name && user_id)) {
      res.status(400).send("All input is required");
    }
    var cond=[user_id,2];
    User.query('SELECT role from users where user_id=? and role=?',cond, function (error, results, fields) {
      if (error) throw error;
      if (results.length > 0) {
          res.status(409).send("Invalid user");
      } else{
        User.query('SELECT category_name from category where category_name="'+category_name+'"', function (error, chkuniq, fields) {
      if (error) throw error;
      if(chkuniq.length > 0)
      {
        res.status(409).send("Category name is unique");
      }else{
        var post={category_name:category_name};
       var query = User.query('INSERT INTO category SET ?', post, function (error, results, fields) {
        if (error) throw error;
        if(results)
        {
          res.status(201).send("Category created successfully");
        }
        // Neat!
        });
      }
      });
      }
      //console.log('The solution is: ', results[0].solution);
    });
    
  }catch (err) {
    console.log(err);
  }
});
//category update
app.post("/updcat", async (req, res) => {
  try {
    // Get user input
    const { category_name, user_id,category_id } = req.body;
    // Validate user input
    if (!(category_name && user_id && category_id)) {
      res.status(400).send("All input is required");
    }
    var cond=[user_id,2];
    User.query('SELECT role from users where user_id=? and role=?',cond, function (error, results, fields) {
      if (error) throw error;
      if (results.length > 0) {
          res.status(409).send("Invalid user");
      } else{
         User.query('SELECT category_name from category where category_name="'+category_name+'" and category_id <>"'+category_id+'"', function (error, chkuniq, fields) {
      if (error) throw error;
      if(chkuniq.length > 0)
      {
        res.status(409).send("Category name is unique");
      }else{
       
       var query = User.query('Update category SET category_name="'+category_name+'" where category_id="'+category_id+'"', function (error, updrows, fields) {
        if (error) throw error;
        if(updrows)
        {
          res.status(201).send("Category updated successfully");
        }
        // Neat!
        });
      }
      });
      }
      //console.log('The solution is: ', results[0].solution);
    });
    
  }catch (err) {
    console.log(err);
  }
});
//delete category
app.post("/delcat", async (req, res) => {
  try {
    // Get user input
    const { category_name, user_id,category_id } = req.body;
    // Validate user input
    if (!(category_name && user_id && category_id)) {
      res.status(400).send("All input is required");
    }
    var cond=[user_id,2];
    User.query('SELECT role from users where user_id=? and role=?',cond, function (error, results, fields) {
      if (error) throw error;
      if (results.length > 0) {
          res.status(409).send("Invalid user");
      } else{
       var query = User.query('delete from category where (category_name="'+category_name+'" or category_id="'+category_id+'")', function (error, updrows, fields) {
        if (error) throw error;
        if(updrows)
        {
          res.status(201).send("Category removed successfully");
        }
        // Neat!
        });
      
      }
      //console.log('The solution is: ', results[0].solution);
    });
    
  }catch (err) {
    console.log(err);
  }
});
//listing category
app.post("/allcat",auth, async (req, res) => {
  try {
    // Get user input
    const { user_id } = req.body;
    // Validate user input
    if (!(user_id)) {
      res.status(400).send("All input is required");
    }
    
    User.query('SELECT user_id from users where user_id="'+user_id+'"', function (error, results, fields) {
      if (error) throw error;
      if (results.length > 0) {
        var query = User.query('Select * from category',  function (error, listcat, fields) {
        if (error) throw error;
        if(listcat.length > 0)
        {
          var category=[];
          listcat.forEach(element =>{
            //console.log(element);
            category.push(element);
          });
          
          res.status(201).send(category);
        }else{
          res.status(400).send("No records found");
        }
        // Neat!
        });
          
      } else{
        
       res.status(409).send("Invalid user");
      }
      //console.log('The solution is: ', results[0].solution);
    });
    
  }catch (err) {
    console.log(err);
  }
});
//list category by admin
app.post("/listcat", async (req, res) => {
  try {
    // Get user input
    const { user_id } = req.body;
    // Validate user input
    if (!(user_id)) {
      res.status(400).send("All input is required");
    }
    
    User.query('SELECT user_id from users where user_id="'+user_id+'"', function (error, results, fields) {
      if (error) throw error;
      if (results.length > 0) {
        var query = User.query('Select * from category',  function (error, listcat, fields) {
        if (error) throw error;
        if(listcat.length > 0)
        {
          var category=[];
          listcat.forEach(element =>{
            //console.log(element);
            category.push(element);
          });
          
          res.status(201).send(category);
        }
        // Neat!
        });
          
      } else{
        
       res.status(409).send("Invalid user");
      }
      //console.log('The solution is: ', results[0].solution);
    });
    
  }catch (err) {
    console.log(err);
  }
});
//User login
app.post("/login", async (req, res) => {
  try {
    // Get user input
    const { email, password } = req.body;

    // Validate user input
    if (!(email && password)) {
      res.status(400).send("All input is required");
    }
    // Validate if user exist in our database
     //await User.find({ email });
     var insertId;
     /* var user = {
        first_name:null,
        last_name:null,
        email: email,
        password: password,
        user_id:null,
        token:null,
        };*/
      var conditions = [email,password];
      var q1 = "SELECT * from users where email='"+email+"' and password='"+password+"'";
      //return q1;
     // res.status(200).json(q1);
     
    User.query(q1, function (error, results, fields) {
      
  if (error) throw error;
    // Neat!
    if(results.length > 0)
    {
      //res.status(200).json(results);
     /* var  user = {
        first_name:results[0].first_name,
        last_name:results[0].last_name,
        email: email,
        password: password,
        user_id:results[0].user_id,
        token:null,
      };*/
      //if (user ) {
       insertId=results[0].user_id;
      // Create token
      const token = jwt.sign(
        { user_id: insertId, email },
        process.env.TOKEN_KEY,
        {
          expiresIn: "2h",
        }
      );

      // save user token
     // user.token = token;
     var user = {
       token : token,
     }
     console.log('UPDATE users SET token = "'+token+'" WHERE user_id = "'+insertId+'"');
      User.query('UPDATE users SET token = "'+token+'" WHERE user_id = "'+insertId+'"', function (error, updrows, fields) {
      if (error) throw error;
        if(updrows)
        {
          res.status(200).json(user);
        }
      });
      
      //}
    }else{
      res.status(400).send("Invalid Credentials");
    }
    });
    //&& (await bcrypt.compare(password, user.password))
    

      // user
      
    
  } catch (err) {
    console.log(err);
  }
});

//Creating blogs
app.post("/addblog",auth, async (req, res) => {
  try {
    // Get user input
    const { user_id,title,description,category_id } = req.body;
    // Validate user input
    if (!(user_id && title && description && category_id)) {
      res.status(400).send("All input is required");
    }
    
    User.query('SELECT user_id from users where user_id="'+user_id+'"', function (error, results, fields) {
      if (error) throw error;
      if (results.length > 0) {
        var post = {title:title,description:description,publisher_id:user_id,category_id:category_id};
        var query = User.query('Insert into blogs set ?',post,  function (error, saveblog, fields) {
        if (error) throw error;
        if(saveblog)
        {
          res.status(201).send("Successfully created");
        }
        // Neat!
        });
          
      } else{
        
       res.status(409).send("Invalid user");
      }
      //console.log('The solution is: ', results[0].solution);
    });
    
  }catch (err) {
    console.log(err);
  }
});
//list publisher blogs
app.post("/listblog",auth, async (req, res) => {
  try {
    // Get user input
    const { user_id } = req.body;
    // Validate user input
    if (!(user_id)) {
      res.status(400).send("All input is required");
    }
    
    User.query('SELECT user_id from users where user_id="'+user_id+'"', function (error, results, fields) {
      if (error) throw error;
      if (results.length > 0) {
        
        var query = User.query('Select * from blogs where publisher_id="'+user_id+'"',  function (error, listblog, fields) {
        if (error) throw error;
        if(listblog.length > 0)
        {
          var blogs = [];
          listblog.forEach(element =>{
            blogs.push(element);
          });
          res.status(201).send(blogs);
        }else{
          res.status(400).send("No records found");
        }
        // Neat!
        });
          
      } else{
        
       res.status(409).send("Invalid user");
      }
      //console.log('The solution is: ', results[0].solution);
    });
    
  }catch (err) {
    console.log(err);
  }
});
//list all blogs
app.post("/listallblog", async (req, res) => {
  try {
    // Get user input
    const { user_id } = req.body;
    // Validate user input
    if (!(user_id)) {
      res.status(400).send("All input is required");
    }
    
    User.query('SELECT user_id from users where user_id="'+user_id+'" and role=1', function (error, results, fields) {
      if (error) throw error;
      if (results.length > 0) {
        
        var query = User.query('Select * from blogs ',  function (error, listblog, fields) {
        if (error) throw error;
        if(listblog.length > 0)
        {
          var blogs = [];
          listblog.forEach(element =>{
            blogs.push(element);
          });
          res.status(201).send(blogs);
        }else{
          res.status(400).send("No records found");
        }
        // Neat!
        });
          
      } else{
        
       res.status(409).send("Invalid user");
      }
      //console.log('The solution is: ', results[0].solution);
    });
    
  }catch (err) {
    console.log(err);
  }
});
//blog update
app.post("/updblog",auth, async (req, res) => {
  try {
    // Get user input
    const { title, description,category_id,user_id,blog_id } = req.body;
    // Validate user input
    if (!(title && user_id && category_id && description && blog_id)) {
      res.status(400).send("All input is required");
    }
    
    User.query('SELECT user_id from users where user_id="'+user_id+'"', function (error, results, fields) {
      if (error) throw error;
      if (results.length > 0) {
        var query = User.query('Update blogs SET title="'+title+'",description="'+description+'",category_id="'+category_id+'" where publisher_id="'+user_id+'" and blog_id="'+blog_id+'"', function (error, updrows, fields) {
        if (error) throw error;
        if(updrows)
        {
          res.status(201).send("Blog updated successfully");
        }
        // Neat!
        });
          
      } else{
       res.status(409).send("Invalid user");
      
      }
      //console.log('The solution is: ', results[0].solution);
    });
    
  }catch (err) {
    console.log(err);
  }
});
//delete category
app.post("/delblog",auth, async (req, res) => {
  try {
    // Get user input
    const { blog_id, user_id } = req.body;
    // Validate user input
    if (!(blog_id && user_id)) {
      res.status(400).send("All input is required");
    }
    
    User.query('SELECT user_id from users where user_id="'+user_id+'"', function (error, results, fields) {
      if (error) throw error;
      if (results.length > 0) {
          var query = User.query('delete from blogs where  blog_id="'+blog_id+'" and publisher_id="'+user_id+'"', function (error, delrows, fields) {
        if (error) throw error;
        if(delrows)
        {
          res.status(201).send("Blog removed successfully");
        }
        // Neat!
        });
          
      } else{
       res.status(409).send("Invalid user");
      
      }
      //console.log('The solution is: ', results[0].solution);
    });
    
  }catch (err) {
    console.log(err);
  }
});

app.get("/welcome", auth, (req, res) => {
  res.status(200).send("Welcome 🙌 ");
});

// This should be the last route else any after it won't work
app.use("*", (req, res) => {
  res.status(404).json({
    success: "false",
    message: "Page not found",
    error: {
      statusCode: 404,
      message: "You reached a route that is not defined on this server",
    },
  });
});



module.exports = app;
