// Importing required packages
const express = require("express");
const app = express();
const bodyParser = require("body-parser");
const mongoose = require("mongoose");
const ejs = require("ejs");
const jwt = require("jsonwebtoken");
const cookieParser = require("cookie-parser");
const bcrypt = require("bcrypt");

// Load environment variables from .env file (for JWT secret and MongoDB URI)
require("dotenv").config();

// Configuring required settings for packages

app.set("view engine", "ejs"); //use ejs for sending data to frontend
app.use(express.json());
app.use(express.static("public")); //use public folder
app.use(cookieParser()); //use cookies
app.use(bodyParser.urlencoded({ extended: true })); //get form data using req.body

let layout = 1;

// Connecting to DB
mongoose.connect(process.env.MONGODB_URI);

//creating user Schema
const userSchema = mongoose.Schema({
  name: String,
  userName: String,
  userEmail: String,
  password: String,
  userGender: String,
  dateOfJoining: Date,
  rank: Number,
  tests: [Object],
  testsStarted: Number,
  testsCompleted: Number,
  timeSpentTyping: Number,
  preferences: [Number],
});

// Initializing DB by creating a model 'user(s)'
const userModel = mongoose.model("user", userSchema);

// Middleware to check if the user is logged in
async function countDocuments() {
  try {
    const count = await userModel.countDocuments({});
    return count;
  } catch (err) {
    console.error(err);
  }
}

const checkAuth = (req, res, next) => {
  const token = req.cookies.Token;

  if (token) {
    jwt.verify(token, process.env.JWT_SECRET, (err, decoded) => {
      if (err) {
        res.clearCookie("Token");
        return res.redirect("/login");
      }

      req.user = decoded.user;
    });
  }
  next();
};

// Root path (default layout)
app.get("/", checkAuth, async (req, res) => {
  // const noUsers = await countDocuments();
  // console.log(typeof noUsers);
  let currentUser =
    req.user &&
    (await userModel.findOne({
      userName: req.user.userName,
    }));

  if (layout == 1) {
    res.render("index", { user: currentUser });
  } else if (layout == 2) {
    res.render("alternateLayout", { user: currentUser });
  }
});

app.get("/alternateLayout", (req, res) => {
  layout = 2;
  res.redirect("/");
});

// Changing the layouts
app.post("/layout1", (req, res) => {
  layout = 1;
  res.redirect("/");
});

app.post("/layout2", (req, res) => {
  res.redirect("/alternateLayout");
});

// User trying to signup
app.get("/signup", (req, res) => {
  res.render("signUp", { error: "" });
});

// User trying to view their profile

app.get("/profile", checkAuth, async (req, res) => {
  if (!req.user) {
    return res.redirect("/login");
  }

  const currentUser = await userModel.findOne({
    userName: req.user.userName,
  });

  if (!currentUser) {
    return res.redirect("/login");
  }

  let highestWpm = 0;
  let avgWpm = 0;
  let avgAccuracy = 0;
  let last5Tests = [];
  let timeTaken = currentUser.timeSpentTyping;
  let allTests = currentUser.tests;
  let noOfTestsCompleted = allTests.length;
  let rank;
  let noOfTestsStarted = currentUser.testsStarted;
  let noOfTestsTimewise = [0, 0, 0, 0];
  let timeWiseData = [
    [0, 0, 0],
    [0, 0, 0],
    [0, 0, 0],
    [0, 0, 0],
  ];
  allTests.forEach((element) => {
    if (element.timeTaken == 15) {
      timeWiseData[0][0] = Math.max(element.wpm, timeWiseData[0][0]);
      timeWiseData[0][1] += element.wpm;
      timeWiseData[0][2] += element.accuracy;
      noOfTestsTimewise[0]++;
    }

    if (element.timeTaken == 30) {
      timeWiseData[1][0] = Math.max(element.wpm, timeWiseData[1][0]);
      timeWiseData[1][1] += element.wpm;
      timeWiseData[1][2] += element.accuracy;
      noOfTestsTimewise[1]++;
    }
    if (element.timeTaken == 60) {
      timeWiseData[2][0] = Math.max(element.wpm, timeWiseData[2][0]);
      timeWiseData[2][1] += element.wpm;
      timeWiseData[2][2] += element.accuracy;
      noOfTestsTimewise[2]++;
    }
    if (element.timeTaken == 120) {
      timeWiseData[3][0] = Math.max(element.wpm, timeWiseData[3][0]);
      timeWiseData[3][1] += element.wpm;
      timeWiseData[3][2] += element.accuracy;
      noOfTestsTimewise[3]++;
    }
    highestWpm = Math.max(highestWpm, element.wpm);
    avgWpm += element.wpm;
    avgAccuracy += element.accuracy;
  });

  if (allTests.length) {
    timeWiseData[0][1] /= noOfTestsTimewise[0];
    timeWiseData[0][2] /= noOfTestsTimewise[0];
    timeWiseData[1][1] /= noOfTestsTimewise[1];
    timeWiseData[1][2] /= noOfTestsTimewise[1];
    timeWiseData[2][1] /= noOfTestsTimewise[2];
    timeWiseData[2][2] /= noOfTestsTimewise[2];
    timeWiseData[3][1] /= noOfTestsTimewise[3];
    timeWiseData[3][2] /= noOfTestsTimewise[3];
  }
  for (let ind = allTests.length - 1, i = 0; ind >= 0, i < 5; ind--, i++) {
    let currentTest = allTests[ind];
    if (currentTest) {
      last5Tests.push([
        currentTest.wpm,
        Math.round((currentTest.accuracy + Number.EPSILON) * 100) / 100,
        currentTest.timeTaken,
        currentTest.date,
      ]);
    }
  }
  while (last5Tests.length < 5) {
    last5Tests.push(["-", "-", "-", "-"]);
  }
  avgWpm /= allTests.length;
  avgWpm = Math.round((avgWpm + Number.EPSILON) * 100) / 100;
  avgAccuracy /= allTests.length;
  avgAccuracy = Math.round((avgAccuracy + Number.EPSILON) * 100) / 100;
  if (allTests.length == 0) {
    (avgWpm = 0), (avgAccuracy = 0);
  }

  for (let i = 0; i < timeWiseData.length; i++) {
    for (let j = 0; j < timeWiseData[i].length; j++) {
      if (isNaN(timeWiseData[i][j])) {
        timeWiseData[i][j] = 0;
      } else {
        timeWiseData[i][j] =
          Math.round((timeWiseData[i][j] + Number.EPSILON) * 100) / 100;
      }
    }
  }
  // let users = await userModel.find();
  let allUsers = await userModel.find();
  try {
    let userWPMs = {};
    allUsers.forEach((user) => {
      let currentUser = user.userName;
      let maxWPM = 0;
      user.tests.forEach((test) => {
        maxWPM = Math.max(maxWPM, test.wpm);
      });
      userWPMs = { ...userWPMs, [currentUser]: maxWPM };
    });
    let sortedUserWPMs = Object.entries(userWPMs).sort((a, b) => b[1] - a[1]);
    userWPMs = Object.fromEntries(sortedUserWPMs);
    console.log(userWPMs);
    rank = 1;
    for (let key in userWPMs) {
      let user = await userModel.findOne({
        userName: key,
      });
      user.rank = rank;
      if (userWPMs[key] == 0) {
        user.rank = 0;
      }
      console.log(currentUser.rank);
      // await user.save();
      // await currentUser.save();
      console.log("update hogaya");
      console.log(currentUser.rank);
      rank++;
    }
  } catch (error) {
    console.log("Error updating user rank", error);
  }

  const profileObject = {
    user: currentUser,
    timeWiseData: timeWiseData,
    last5Tests: last5Tests,
    info: [
      currentUser.rank,
      highestWpm,
      avgWpm,
      avgAccuracy,
      noOfTestsStarted,
      noOfTestsCompleted,
      timeTaken,
    ],
  };

  res.render("profile", { userInfo: profileObject });
});

//user opening settings page
app.get("/settings", checkAuth, async (req, res) => {
  let currentUser = {
    name: null,
    userName: null,
    userEmail: null,
    password: null,
  };
  if (req.user) {
    currentUser = await userModel.findOne({
      userName: req.user.userName,
    });
  }
  res.render("settings", { user: currentUser });
});

// User trying to contact us
app.get("/contact-us", checkAuth, (req, res) => {
  res.render("contactUs", { user: req.user });
});

app.get("/leaderBoard", checkAuth, async (req, res) => {
  if (!req.user) {
    return res.redirect("/login");
  }
  let currentUser = {
    name: null,
    userName: null,
    userEmail: null,
    password: null,
  };
  if (req.user) {
    currentUser = await userModel.findOne({
      userName: req.user.userName,
    });
  }
  let dataToReturn;
  let time15 = [];
  let time30 = [];
  let time60 = [];
  let time120 = [];
  const allUsers = await userModel.find();
  allUsers.forEach((user) => {
    if (user.tests.length > 0) {
      const userTests = user.tests;
      userTests.forEach((test) => {
        let temp = [];
        let uName = user.userName;
        if (test.timeTaken == 15) {
          if (user.userName == currentUser.userName) {
            uName = user.userName + " (You)";
          }
          temp.push(test.wpm, uName, test.date, test.accuracy);
          time15.push(temp);
        }
        if (test.timeTaken == 30) {
          if (user.userName == currentUser.userName) {
            uName = user.userName + " (You)";
          }
          temp.push(test.wpm, uName, test.date, test.accuracy);
          time30.push(temp);
        }
        if (test.timeTaken == 60) {
          if (user.userName == currentUser.userName) {
            uName = user.userName + " (You)";
          }
          temp.push(test.wpm, uName, test.date, test.accuracy);
          time60.push(temp);
        }
        if (test.timeTaken == 120) {
          if (user.userName == currentUser.userName) {
            uName = user.userName + " (You)";
          }
          temp.push(test.wpm, uName, test.date, test.accuracy);
          time120.push(temp);
        }
      });
    }
  });

  time15.sort((a, b) => b[0] - a[0]);
  time30.sort((a, b) => b[0] - a[0]);
  time60.sort((a, b) => b[0] - a[0]);
  time120.sort((a, b) => b[0] - a[0]);
  dataToReturn = {
    15: time15,
    30: time30,
    60: time60,
    120: time120,
  };

  res.render("leaderBoard", { data: dataToReturn });
});
// User trying to login
app.get("/login", (req, res) => {
  res.render("login");
});

// User trying to logout
app.get("/logout", (req, res) => {
  res.cookie("Token", "");
  res.clearCookie("Token");
  res.redirect("/");
});

// Verifying credentials for logging-in
app.post("/login", async (req, res) => {
  let user;
  try {
    user = await userModel.findOne({ userName: req.body.userName });
    if (!user) {
      return res.render("login", { error: "Invalid credentials" });
    }

    const match = await bcrypt.compare(req.body.password, user.password);
    if (match) {
      const token = jwt.sign({ user: user }, process.env.JWT_SECRET);
      res.cookie("Token", token, {
        httpOnly: true,
        secure: process.env.NODE_ENV === "production",
      });
      return res.redirect("/");
    } else {
      return res.render("login", { error: "Invalid credentials" });
    }
  } catch (err) {
    console.error("Error during login:", err);
    return res.render("login", {
      error: "An error occurred. Please try again later.",
    });
  }
});

// Verifying credentials for signing-up
app.post("/signUp", async (req, res) => {
  const { name, userName, userEmail, password, userGender } = req.body;
  const user = await userModel.findOne({ userName: req.body.userName });
  if (user) {
    return res.render("signUp", {
      error: "Username already exists, please choose a different one",
    });
  }

  let noUsers = await countDocuments();
  noUsers = Number(noUsers);
  noUsers++;

  console.log(noUsers);

  bcrypt.genSalt(10, (err, salt) => {
    if (!err) {
      bcrypt.hash(password, salt, async (er, hash) => {
        if (!er) {
          const createdUser = await userModel.create({
            name,
            userName,
            userEmail,
            password: hash,
            userGender,
            dateOfJoining: Date.now(),
            rank: noUsers,
            tests: [],
            testsStarted: 0,
            testsCompleted: 0,
            timeSpentTyping: 0,
            preferences: [],
          });

          let token = jwt.sign({ user: createdUser }, process.env.JWT_SECRET);
          res.cookie("Token", token, {
            httpOnly: true,
            secure: process.env.NODE_ENV === "production",
          });
          res.redirect("/");
        }
      });
    } else {
      res.send("Uh Oh! Something Went Wrong");
    }
  });
});
app.get("/api", checkAuth, async (req, res) => {
  if (!req.user) {
    return res.status(401).json({ error: "Unautorized" });
  }
  const currentUser = await userModel.findOne({
    userName: req.user.userName,
  });
  if (!currentUser) {
    return res.status(404).json({ error: "user not found" });
  }
  res.json(currentUser);
});

app.post("/api", async (req, res) => {
  try {
    const user = await userModel.findOne({
      userName: req.body.currentUser.userName,
    });
    if (req.body.test.wpm) {
      user.testsStarted++;
      user.testsCompleted++;
      user.tests.push(req.body.test);
    } else {
      user.testsStarted++;
    }
    // console.log("tf65f5f", req.body.test.timeTaken);
    user.timeSpentTyping += req.body.test.timeTaken;
    user.save();
    res.status(200);
  } catch (err) {
    res.status(500).send(err);
  }
});
// app.post("/saveInfo", async (req, res) => {
//   try {
//     const user = await userModel.findOne({
//       userName: req.body.oldUserName,
//     });
//     bcrypt.genSalt(10, (err, salt) => {
//       if (!err) {
//         bcrypt.hash(req.body.password, salt, async (er, hash) => {
//           if (!er) {
//             user.name = req.body.name;
//             user.userName = req.body.username;
//             user.password = hash;
//             user.userEmail = req.body.email;
//             user.userGender = req.body.gender;
//             user.save();
//             res.status(200);
//           }
//         });
//       } else {
//         res.send("Uh Oh! Something Went Wrong");
//       }
//     });
//   } catch (err) {
//     res.status(500).send(err);
//   }
// });

app.post("/saveInfo", async (req, res) => {
  try {
    const user = await userModel.findOne({
      userName: req.body.oldUserName,
    });

    if (user) {
      // Update other fields
      user.name = req.body.name;
      user.userName = req.body.username;
      user.userEmail = req.body.email;
      user.userGender = req.body.gender;

      // Check if the password has been changed
      if (req.body.password !== user.password) {
        // Hash the new password
        bcrypt.genSalt(10, (err, salt) => {
          if (!err) {
            bcrypt.hash(req.body.password, salt, async (er, hash) => {
              if (!er) {
                user.password = hash; // Update with new hashed password
                await user.save();
                res.status(200).send("User info updated successfully");
              } else {
                res.status(500).send("Error while hashing the password");
              }
            });
          } else {
            res.status(500).send("Error generating salt for hashing");
          }
        });
      } else {
        // If password isn't changed, just save other info
        await user.save();
        res
          .status(200)
          .send("User info updated successfully without changing the password");
      }
    } else {
      res.status(404).send("User not found");
    }
  } catch (err) {
    res.status(500).send("Internal server error");
  }
});

app.post("/delAcc", checkAuth, async (req, res) => {
  const currentUser = await userModel.findOne({
    userName: req.user.userName,
  });

  try {
    const match = await bcrypt.compare(req.body.password, currentUser.password);
    if (match) {
      await userModel.findOneAndDelete({
        userName: currentUser.userName,
      });
      return res.sendStatus(200); // Send success status
    } else {
      return res.status(401).send("Incorrect password. Please try again."); // Send error message
    }
  } catch (err) {
    res.status(500).send(err);
  }
});

// app.post("/contactUs", (req, res) => {
//   res.redirect("/")
// })

// Listening on Port
app.listen(3000, () => {
  console.log("server started on port 3000");
});
const nodemailer = require("nodemailer");

// Handle form submission
app.post("/contactUs", (req, res) => {
  const { contactName, contactEmail, contactMessage } = req.body;

  // Create a transporter using your email service (e.g., Gmail)
  const transporter = nodemailer.createTransport({
    service: "gmail",
    auth: {
      user: process.env.EMAIL_USER_FROM, // Replace with your email
      pass: process.env.EMAIL_PASS, // Replace with your email password (or use an app-specific password)
    },
  });

  const mailOptions = {
    from: contactEmail, // Email from the form
    to: process.env.EMAIL_USER_TO, // Your recipient email
    subject: `Message from ${contactName}`,
    text: contactMessage, // The message content
  };

  // Send the email
  transporter.sendMail(mailOptions, (error, info) => {
    if (error) {
      console.log(error);
      return res.status(500).send("Error occurred");
    } else {
      console.log("Email sent: " + info.response);
      console.log(contactEmail, contactName, contactMessage);
      return res.redirect("/messageSent?status=200");
    }
  });
});

app.get("/messageSent", (req, res) => {
  if (Number(req.query.status) === 200) {
    return res.redirect("/");
  }
  // res.send("Your message was sent")
});

app.get("/l", async (req, res) => {
  try {
    rankUsersAndUpdateDB();
    // Fetch the users sorted by rank (ascending)
    const users = await userModel.find().sort({ rank: 1 });

    // Send the ranked users as JSON
    res.json(users);
  } catch (error) {
    res.status(500).json({ error: "Failed to load leaderboard" });
  }
});

async function rankUsersAndUpdateDB() {}
