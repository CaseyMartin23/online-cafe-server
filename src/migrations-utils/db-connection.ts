import mongoose from "mongoose"
import { config } from "dotenv";

config()

export const connectToDb = async () => {
  return mongoose.createConnection(process.env.DATABASE_URL, { dbName: 'online-cafe' });
}