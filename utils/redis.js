import Redis from 'ioredis';
require('dotenv').config();

// Function to establish a Redis connection
const redisClient = () => {
  if (process.env.REDIS_URL) {
    console.log('Redis Connected');

    // Pass the Redis URL directly to ioredis
    return new Redis(process.env.REDIS_URL);
  }

  // Throw an error if REDIS_URL is not defined
  throw new Error('Redis connection failed: REDIS_URL is not defined');
};

// Create and export the Redis client
export const redis = redisClient();

// Optional: Handle connection events for better debugging
redis.on('connect', () => {
  console.log('Successfully connected to Redis');
});

redis.on('error', (err) => {
  console.error('Redis connection error:', err);
});
