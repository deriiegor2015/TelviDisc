const express = require("express");
const fs = require("fs");
const http = require("http");
const { Server } = require("socket.io");

const app = express();
const server = http.createServer(app);
const io = new Server(server);

app.use(express.json());
app.use(express.static("public"));

const USERS_FILE = "./users.json";

function loadUsers() {
  return JSON.parse(fs.readFileSync(USERS_FILE));
}
function saveUsers(users) {
  fs.writeFileSync(USERS_FILE, JSON.stringify(users, null, 2));
}

// Реєстрація
app.post("/register", (req, res) => {
  const { username, password } = req.body;
  const users = loadUsers();

  if (users.find(u => u.username === username)) {
    return res.json({ success: false, message: "User exists" });
  }

  users.push({ username, password });
  saveUsers(users);
  res.json({ success: true });
});

// Вхід
app.post("/login", (req, res) => {
  const { username, password } = req.body;
  const users = loadUsers();

  const user = users.find(
    u => u.username === username && u.password === password
  );

  if (!user) {
    return res.json({ success: false });
  }

  res.json({ success: true });
});

// ЧАТ
io.on("connection", socket => {
  socket.on("message", data => {
    io.emit("message", data);
  });
});

server.listen(3000, () => {
  console.log("Server running http://localhost:3000");
});
