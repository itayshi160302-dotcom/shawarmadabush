const express = require("express");
const sqlite3 = require("sqlite3").verbose();
const cors = require("cors");

const app = express();

app.use(cors());
app.use(express.json());

const db = new sqlite3.Database("./database.db");

db.run(`
CREATE TABLE IF NOT EXISTS workers (
id INTEGER PRIMARY KEY AUTOINCREMENT,
name TEXT UNIQUE,
password TEXT,
sales INTEGER DEFAULT 0,
orders INTEGER DEFAULT 0
)
`);

app.get("/", (req,res)=>{
res.send("Shawarma Dabush API Running 🚀");
});

app.post("/create-worker",(req,res)=>{

const { name, password } = req.body;

if(!name || !password){

return res.status(400).json({
error:"Missing data"
});

}

db.run(

`INSERT INTO workers
(name,password,sales,orders)
VALUES (?,?,0,0)`,

[name,password],

function(err){

if(err){

return res.status(400).json({
error:"Worker already exists"
});

}

res.json({
success:true
});

}

);

});

app.get("/workers",(req,res)=>{

db.all(
"SELECT name,sales,orders FROM workers",
[],
(err,rows)=>{

if(err){
return res.status(500).json({
error:"Server error"
});
}

res.json(rows);

}
);

});

app.get("/test-create",(req,res)=>{

db.run(
`INSERT INTO workers
(name,password,sales,orders)
VALUES (?,?,0,0)`,

["itay","1234"],

function(err){

if(err){
return res.send(err.message);
}

res.send("Worker created");

}

);

});

app.post("/login",(req,res)=>{

const { name, password } = req.body;

db.get(
"SELECT * FROM workers WHERE name = ?",
[name],
(err,row)=>{

if(err){
return res.status(500).json({
error:"Server error"
});
}

if(!row){
return res.status(404).json({
error:"Worker not found"
});
}

if(row.password !== password){
return res.status(401).json({
error:"Wrong password"
});
}

res.json({
success:true,
worker:{
name:row.name,
sales:row.sales,
orders:row.orders
}
});

}
);

});

app.listen(3000,()=>{
console.log("Server running on port 3000");
});