const mongoose = require("mongoose");
const encrypt = require("mongoose-encryption"); 

mongoose.connect("mongodb://127.0.0.1/authDB")
    .then(() => {
        console.log("MongoDb connected");
    })
    .catch((error) => {
        console.log("MongoDb failed to connect: ", error);
    });

const registerSchema = new mongoose.Schema({
    email: {
        type: String,
        required: true
    },
    password: {
        type: String,
        required: true
    } 
});

// const secret = "ElectricCarsAreShit.";
// registerSchema.plugin(encrypt, {
//     secret: secret, 
//     encryptedFields: ["password"]
// });

const register = new mongoose.model("users", registerSchema);

module.exports = register