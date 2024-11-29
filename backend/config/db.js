import mongoose from "mongoose"


export const connectDB = async () => {
  try {
    const conn = await mongoose.connect(process.env.MONGO_URI);
    console.log(`Mongo DB connected: ${conn.connection.host}`);
  } catch (error) {
    console.error(`Error connectiong do db: ${error.message}`);
    process.exit(1); // 1 means failed and 0 is success
  }
}
