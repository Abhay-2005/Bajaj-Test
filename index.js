import express from "express";
import dotenv from "dotenv";
import axios from "axios";

dotenv.config();

const app = express();

app.use(express.json());

const PORT = process.env.PORT;
const EMAIL = process.env.EMAIL;

console.log("Gemini Key:", process.env.GEMINI_KEY);




// Fibonacci
function getFibonacci(n) {
  let result = [];

  let a = 0, b = 1;

  for (let i = 0; i < n; i++) {
    result.push(a);
    [a, b] = [b, a + b];
  }

  return result;
}

// Prime Check
function isPrime(num) {
  if (num < 2) return false;

  for (let i = 2; i * i <= num; i++) {
    if (num % i === 0) return false;
  }

  return true;
}

// GCD (HCF)
function gcd(a, b) {
  return b === 0 ? a : gcd(b, a % b);
}

// LCM
function lcm(a, b) {
  return (a * b) / gcd(a, b);
}

// Array LCM
function arrayLCM(arr) {
  return arr.reduce((acc, num) => lcm(acc, num));
}

// Array HCF
function arrayHCF(arr) {
  return arr.reduce((acc, num) => gcd(acc, num));
}

/* ------------------ Health Check------------------ */

app.get("/health", (req, res) => {
  return res.status(200).json({
    is_success: true,
    official_email: EMAIL
  });
});

/* ------------------ AI Function ------------------ */

async function getAIResponse(question) {

  const url =
    "https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent?key=" +
    process.env.GEMINI_KEY;

  const body = {
    contents: [
      {
        parts: [{ text: question }]
      }
    ]
  };

  try {

    const res = await axios.post(url, body, {
      headers: {
        "Content-Type": "application/json"
      }
    });

    return res.data.candidates[0].content.parts[0].text.trim();

  } catch (err) {

    console.log("GEMINI ERROR:", err.response?.data || err.message);
    throw new Error("AI service unavailable");
  }
}



/* ------------------main api----------------- */

app.post("/bfhl", async (req, res) => {
  try {
    const body = req.body;

   
    const keys = Object.keys(body);

    if (keys.length !== 1) {
      return res.status(400).json({
        is_success: false,
        error: "Only one input key allowed"
      });
    }

    let key = keys[0];
    let value = body[key];

    let result;

    switch (key) {

      case "fibonacci":

        if (!Number.isInteger(value) || value < 0) {
          throw new Error("Invalid Fibonacci input");
        }

        result = getFibonacci(value);
        break;

      case "prime":

        if (!Array.isArray(value)) {
          throw new Error("Prime input must be array");
        }

        result = value.filter(isPrime);
        break;

      case "lcm":

        if (!Array.isArray(value)) {
          throw new Error("LCM input must be array");
        }

        result = arrayLCM(value);
        break;

      case "hcf":

        if (!Array.isArray(value)) {
          throw new Error("HCF input must be array");
        }

        result = arrayHCF(value);
        break;

      case "AI":

        if (typeof value !== "string") {
          throw new Error("AI input must be string");
        }

        result = await getAIResponse(value);
        break;

      default:
        throw new Error("Invalid Key");
    }

    return res.status(200).json({
      is_success: true,
      official_email: EMAIL,
      data: result
    });

  } catch (error) {

    console.error(error.message);

    return res.status(400).json({
      is_success: false,
      error: error.message
    });
  }
});

/* ------------------ Server Start ------------------ */

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
