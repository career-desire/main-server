import mongoose from "mongoose";

const connectDB = async () => {
    try {
        await mongoose.connect(process.env.MONGO_URI, {});
        console.log("Connected to database successfully")
    } catch (error) {
        console.log(`Could not connect to database:  ${error.message}`)
    }
};

export default connectDB;