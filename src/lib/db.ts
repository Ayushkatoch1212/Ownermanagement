import mongoose from "mongoose";

const MONGODB_URI = process.env.MONGODB_URI;

if (!MONGODB_URI) {
  throw new Error("MONGODB_URI is not configured");
}

console.log("MongoDB URI found");

type MongooseCache = {
  conn: typeof mongoose | null;
  promise: Promise<typeof mongoose> | null;
};

const globalForMongoose = globalThis as unknown as {
  mongoose: MongooseCache | undefined;
};

const cached =
  globalForMongoose.mongoose ?? {
    conn: null,
    promise: null,
  };

globalForMongoose.mongoose = cached;

export async function connectDB() {
  // Already connected
  if (cached.conn) {
    console.log("MongoDB: Using existing connection");
    return cached.conn;
  }

  // Create connection
  if (!cached.promise) {
    console.log("MongoDB: Connecting...");

    cached.promise = mongoose
      .connect(MONGODB_URI!, {
        bufferCommands: false,
      })
      .then((mongooseInstance) => {
        console.log("MongoDB: Connected successfully");
        console.log(
          "MongoDB Host:",
          mongooseInstance.connection.host
        );
        console.log(
          "MongoDB Database:",
          mongooseInstance.connection.name
        );

        return mongooseInstance;
      })
      .catch((error) => {
        console.error("MongoDB: Connection failed");
        console.error(error);

        // Reset promise so another request can try again
        cached.promise = null;

        throw error;
      });
  } else {
    console.log("MongoDB: Connection already in progress...");
  }

  cached.conn = await cached.promise;

  return cached.conn;
}