import mongoose from "mongoose";

const MONGODB_URI = process.env.MONGODB_URI as string;

if (!MONGODB_URI) {
    throw new Error("Please define the MONGODB_URI environment variable");
}

// Avoid multiple connections in development due to hot reload
declare global {
    var mongoose: {
        conn: mongoose.Mongoose | null;
        promise: Promise<mongoose.Mongoose> | null;
    };
}

let cached = global.mongoose;

if (!cached) {
    cached = global.mongoose = { conn: null, promise: null };
}
console.log("MONGODB_URI", process.env.MONGODB_URI);
console.log("MONGODB_URI", MONGODB_URI);
async function connectDB(): Promise<mongoose.Mongoose> {
    if (cached.conn) return cached.conn;

    if (!cached.promise) {
        cached.promise = mongoose.connect(MONGODB_URI, {
            dbName: "authdb", // optional: define default DB name
            bufferCommands: false,
        });
    }

    cached.conn = await cached.promise;
    return cached.conn;
}

export default connectDB;
