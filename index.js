// Basic Express Server Setup
const express = require("express");
const mongoose = require("mongoose");
const cors = require("cors");
const userRoutes = require("./routes/userRoutes");
const productRoutes = require("./routes/productRoutes");
const orderRoutes = require("./routes/orderRoutes");

const app = express();
const port = process.env.PORT || 7000;
mongoose.set('strictQuery', false);

// Mongoose Connection Setup
mongoose.connect(`mongodb+srv://machrispasana:admin123@224-pasana.gswcpei.mongodb.net/ecommerce-API?retryWrites=true&w=majority`, 
    {
        useNewUrlParser: true,
        useUnifiedTopology: true
    }
);

let db = mongoose.connection;
db.on("error", () => console.error(`Connection Error.`));
db.once("open", () => console.error(`Yahoo! you are now connected to MongoDB! :)`))

app.use(cors());
app.use(express.json());
app.use(express.urlencoded({extended: true}));

// Main URI
app.use("/users", userRoutes);
app.use("/products", productRoutes);
app.use("/orders", orderRoutes);


app.listen(port, () => {console.log(`API is now running at port ${port}`)});