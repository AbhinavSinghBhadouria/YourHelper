require("dotenv").config();
const app = require("./src/app");
const connectDB = require("./src/config/database");


const PORT = 3000;

connectDB().then(() => {
  app.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`);
  });
}).catch(err => {
  console.error("Failed to connect to database", err);
});

