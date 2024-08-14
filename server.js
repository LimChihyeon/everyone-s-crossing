const express = require("express");
const mysql = require("mysql");
const cors = require("cors");
const path = require("path");
const multer = require("multer");
const { spawn } = require("child_process");
const fs = require("fs");

const app = express();
const port = 3000;

app.use(cors());
app.use(express.json());

const db = mysql.createConnection({
  host: "127.0.0.1",
  user: "lch",
  password: "dlaclgus1106",
  database: "animalforest",
});

db.connect((err) => {
  if (err) {
    console.error("MySQL 연결 실패:", err);
    return;
  }
  console.log("MySQL 연결 성공");
});

//물고기도감
app.get("/fish", (req, res) => {
  console.log("GET /fish 요청 받음");
  const sql = "SELECT name, image_url, total_catch, sell_nook FROM fish_data";
  db.query(sql, (err, result) => {
    if (err) {
      console.error("데이터베이스 쿼리 실패:", err);
      return res.status(500).send(err);
    }

    console.log("데이터베이스 쿼리 성공:", result);

    const dataWithNames = result.map((item) => ({
      ...item,
      catchphrases: ["Default catchphrase"],
      render_url: item.image_url,
    }));

    res.json(dataWithNames);
  });
});

//버그 도감
app.get("/bugs", (req, res) => {
  console.log("GET /bugs 요청 받음");
  const sql = "SELECT name, image_url, total_catch, sell_nook FROM bug_data";
  db.query(sql, (err, result) => {
    if (err) {
      console.error("데이터베이스 쿼리 실패:", err);
      return res.status(500).send(err);
    }

    console.log("데이터베이스 쿼리 성공:", result);

    const dataWithNames = result.map((item) => ({
      ...item,
      catchphrases: ["Default catchphrase"],
    }));

    res.json(dataWithNames);
  });
});

//주민 도감
app.get("/villagers", (req, res) => {
  console.log("GET /villagers 요청 받음");
  const sql = "SELECT name, image_url FROM villager_data";
  db.query(sql, (err, result) => {
    if (err) {
      console.error("데이터베이스 쿼리 실패:", err);
      return res.status(500).send(err);
    }

    console.log("데이터베이스 쿼리 성공:", result);

    const dataWithNames = result.map((item) => ({
      ...item,
      catchphrases: ["Default catchphrase"],
    }));

    res.json(dataWithNames);
  });
});

const upload = multer({ dest: "uploads/" });

app.post("/upload", upload.single("photo"), (req, res) => {
  const { file } = req;
  console.log("File received:", file);

  const pythonProcess = spawn("python", ["mydesign.py", file.path]);

  pythonProcess.stdout.on("data", (data) => {
    const resizedImagePath = data.toString().trim();
    console.log("Resized image path:", resizedImagePath);
    res.sendFile(path.resolve(resizedImagePath), (err) => {
      if (err) {
        console.error("Error sending file:", err);
        res.status(500).send(err);
      } else {
        // 업로드된 파일 및 리사이즈된 파일 삭제
        fs.unlinkSync(file.path, (err) => {
          if (err) console.error("Error deleting original file:", err);
        });
        fs.unlinkSync(resizedImagePath, (err) => {
          if (err) console.error("Error deleting resized file:", err);
        });
      }
    });
  });

  pythonProcess.stderr.on("data", (data) => {
    console.error(`stderr: ${data}`);
    res.status(500).send(`Python error: ${data}`);
  });

  pythonProcess.on("close", (code) => {
    console.log(`Python process exited with code ${code}`);
  });
});

app.post("/login", (req, res) => {
  const { username, password } = req.body;
  console.log(`로그인 시도: ${username}, ${password}`);
  const sql = "SELECT * FROM users WHERE username = ? AND password = ?";
  db.query(sql, [username, password], (err, result) => {
    if (err) {
      console.error("실패", err);
      return res.status(500).send(err);
    }
    if (result.length > 0) {
      res.json({ success: true });
    } else {
      res.json({ success: false, message: "Invalid credentials" });
    }
  });
});

app.post("/signup", (req, res) => {
  const { email, password } = req.body;
  console.log(`회원가입 시도: ${email}`);
  const checkUserSql = "SELECT * FROM users WHERE username = ?";
  db.query(checkUserSql, [email], (err, result) => {
    if (err) {
      console.error("확인 실패", err);
      return res
        .status(500)
        .json({ success: false, message: "Database query error" });
    }
    if (result.length > 0) {
      console.log("사용자 중복", result);
      return res.json({ success: false, message: "User already exists" });
    } else {
      const insertUserSql =
        "INSERT INTO users (username, password) VALUES (?, ?)";
      db.query(insertUserSql, [email, password], (err, result) => {
        if (err) {
          console.error("사용자 추가 에러", err);
          return res
            .status(500)
            .json({ success: false, message: "Database insert error" });
        }
        console.log("사용자 추가 성공:", result);
        return res.json({ success: true });
      });
    }
  });
});

app.listen(port, () => {
  console.log(`서버 실행`);
});
