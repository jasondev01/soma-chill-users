const express = require("express");
const cors = require("cors");
const mongoose = require("mongoose");
const userRoute = require("./Routes/userRoute");

const app = express(); // add extra capability
require("dotenv").config(); 

const corsOptions = {
    origin: ["https://soma-chill.vercel.app", "http://localhost:5173"],
    credentials: true,
};

// api routes // middlewares
app.use(express.json());
app.use(cors(corsOptions)); 
app.use("/api/users", userRoute);

// root route
app.get("/", (req, res) => {
    res.send("Kindly give a star to this repository before forking. Thanks!");
});

const port = process.env.PORT || 5000;
const uri = process.env.ATLAS_URI || 5000;

app.listen(port, (req, res) => {
    console.log(`server running on port: ${port}`);
});

mongoose
.connect(uri, {
    useNewUrlParser: true,
    useUnifiedTopology: true
})
.then(() => {
    console.log("MongoDB connection establised");
})
.catch((error) => console.log("MongoDB Connection failed: ", error.message));
