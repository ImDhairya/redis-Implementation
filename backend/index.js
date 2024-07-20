import express from "express";
import dotenv from "dotenv";
import redis from "redis";
import axios from "axios";
const app = express();
dotenv.config();

app.use("/hello", async (req, res) => {
  res.json({
    data: "nai hai",
  });
});

// create redis client to connect to redis server
let redisClient;
(async () => {
  redisClient = redis.createClient();

  redisClient.on("error", (error) => {
    console.log(error);
  });
  await redisClient.connect();
})();

// get data
app.get("/get-data", async (req, res) => {
  try {
    await axios
      .get("https://jsonplaceholder.typicode.com/posts")
      .then((response) => {
        return res.json({data: response.data});
      });
  } catch (error) {
    console.log(error);
  }
});

//get data with redis
app.get("/get-data-redis", async (req, res) => {
  let data = "";
  try {
    let cacheData = await redisClient.get("data");
    if (cacheData) {
      return res.json({data: cacheData});
    }
    await axios
      .get("https://jsonplaceholder.typicode.com/posts")
      .then((response) => {
        data = response.data;
        // return res.json({data: response.data});
      });
    await redisClient.set("data", JSON.stringify(data));
    return res.json({data});
  } catch (error) {
    console.log(error);
  }
});

// calculatedata with redis
app.get("/claculate-data-redis", async (req, res) => {
  let calcualtedData = 0;

  const cachedData = await redisClient.get("calculatedData");
  if (cachedData) {
    return res.json({data: cachedData});
  }
  for (let i = 0; i < 10000000000; i++) {
    calcualtedData += i;
  }
  await redisClient.set("calculatedData", calcualtedData);
  return res.json({data: calcualtedData});
  // check if data already cached in redis
});
//calculatedata without redis
app.get("/calculate-data", (req, res) => {
  try {
    let calcualtedData = 0;
    for (let i = 0; i < 10000000000; i++) {
      calcualtedData += i;
    }
    return res.json(calcualtedData);
  } catch (error) {
    console.log("Error generating data", error);
  }
});

app.listen(process.env.PORT, () => {
  console.log("Listening to port ", process.env.PORT);
});
