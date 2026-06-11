const ADMIN_PASSWORD = "dabush123";

let currentOrder = [];

// ======================
// MENU
// ======================

const menu = {

shawarma:[
{name:"שווארמה בפיתה 🥙",price:180},
{name:"שווארמה בלאפה 🌯",price:220},
{name:"שווארמה בצלחת 🍽",price:280}
],

drinks:[
{name:"קולה 🥤",price:40},
{name:"ספרייט 🥤",price:40},
],

extras:[
{name:"צ'יפס 🍟",price:60},
{name:"חמוצים 🥒",price:30}
]

};

// ======================
// LOGIN
// ======================

async function login(){

const worker =
document.getElementById(
"workerNameInput"
).value.trim();

const password =
document.getElementById(
"workerPasswordInput"
).value;

if(!worker || !password){

alert("מלא שם וסיסמה");
return;

}

try{

const response =
await fetch(

"https://shawarmadabush.onrender.com/login",
{
method:"POST",
headers:{
"Content-Type":"application/json"
},
body:JSON.stringify({
name:worker,
password:password
})
}
);

const data =
await response.json();

if(!response.ok){

alert(
data.error || "שגיאה"
);

return;

}

localStorage.setItem(
"currentWorker",
worker
);

startSystem();

}catch(err){

alert(
"לא ניתן להתחבר לשרת"
);

console.error(err);

}

}

function startSystem(){

const worker =
localStorage.getItem(
"currentWorker"
);

document
.getElementById("loginPage")
.classList.add("hidden");

document
.getElementById("app")
.classList.remove("hidden");

document
.getElementById(
"workerDisplay"
).innerText = worker;

updateManager();

}

window.onload = ()=>{

const worker =
localStorage.getItem(
"currentWorker"
);

if(worker){
startSystem();
}

document
.getElementById("category")
.addEventListener(
"change",
loadProducts
);

};

// ======================
// PRODUCTS
// ======================

function loadProducts(){

const category =
document.getElementById(
"category"
).value;

const product =
document.getElementById(
"product"
);

product.innerHTML =
"<option>בחר מוצר</option>";

if(!menu[category]) return;

menu[category].forEach(item=>{

product.innerHTML +=
`
<option value="${item.name}|${item.price}">
${item.name} - ₪${item.price}
</option>
`;

});

}

// ======================
// ORDER
// ======================

function addItem(){

const value =
document.getElementById(
"product"
).value;

if(
!value ||
value==="בחר מוצר"
){
alert("בחר מוצר");
return;
}

const qty =
Number(
document.getElementById(
"quantity"
).value
);

const parts =
value.split("|");

const name =
parts[0];

const price =
Number(parts[1]);

currentOrder.push({

name,
price,
qty,
total:price*qty

});

renderOrder();

}

function renderOrder(){

const table =
document.getElementById(
"invoiceItems"
);

table.innerHTML = "";

let total = 0;

currentOrder.forEach(item=>{

total += item.total;

table.innerHTML +=
`
<tr>
<td>${item.name}</td>
<td>${item.qty}</td>
<td>₪${item.total}</td>
</tr>
`;

});

document
.getElementById(
"totalPrice"
).innerText = total;

}

// ======================
// RECEIPT
// ======================

function generateInvoice(){

if(currentOrder.length===0){

alert("אין מוצרים");
return;

}

const worker =
localStorage.getItem(
"currentWorker"
);

const total =
document.getElementById(
"totalPrice"
).innerText;

const typedSignature =
document.getElementById(
"typedSignature"
).value;

let products = "";

currentOrder.forEach(item=>{

products +=
`
<div class="receipt-line">
<span>${item.name} x${item.qty}</span>
<span>₪${item.total}</span>
</div>
`;

});

document
.getElementById(
"invoicePreview"
).innerHTML =

`
<div class="receipt">

<div class="receipt-header">

<h1>
 שווארמה דבוש 🌯
</h1>

<p>
${new Date().toLocaleString()}
</p>

</div>

<hr>

<p>
עובד:
<b>${worker}</b>
</p>

<hr>

${products}

<hr>

<div class="receipt-total">

₪${total}

</div>

<div class="employee-signature">

<div style="
font-family:'Great Vibes', cursive;
font-size:60px;
text-align:center;
margin-top:20px;
">
${worker}
</div>

<h4>
חתימת העובד
</h4>

</div>

</div>

</div>

</div>
`;

fetch(
"https://shawarmadabush.onrender.com/update-sales",
{
method: "POST",
headers: {
"Content-Type": "application/json"
},
body: JSON.stringify({
name: worker,
sales: Number(total)
})
}
)
.then(function(){
updateManager();
})
.catch(function(err){
console.error(err);
});

}

// ======================
// DOWNLOAD IMAGE
// ======================

function downloadReceipt(){

const receipt =
document.getElementById(
"invoicePreview"
);

html2canvas(receipt)
.then(canvas=>{

const link =
document.createElement("a");

link.download =
"shawarma-dabush.png";

link.href =
canvas.toDataURL();

link.click();

});

}

// ======================
// CLEAR
// ======================

function clearInvoice(){

currentOrder = [];

document
.getElementById(
"invoiceItems"
).innerHTML = "";

document
.getElementById(
"totalPrice"
).innerText = "0";

document
.getElementById(
"invoicePreview"
).innerHTML =

`
<p>
לא נוצרה חשבונית
</p>
`;

}

// ======================
// MANAGER
// ======================

function openManager(){

document
.getElementById(
"managerModal"
)
.classList.remove("hidden");

}

function closeManager(){

document
.getElementById(
"managerModal"
)
.classList.add("hidden");

}

function managerLogin(){

const pass =
document.getElementById(
"managerPassword"
).value;

if(pass!==ADMIN_PASSWORD){

alert("סיסמה שגויה");
return;

}

document
.getElementById(
"managerLogin"
)
.classList.add("hidden");

document
.getElementById(
"managerPanel"
)
.classList.remove("hidden");

updateManager();

}

// ======================
// STATS
// ======================

async function updateManager(){

const response =
await fetch(
"https://shawarmadabush.onrender.com/workers"
);

const workers =
await response.json();

let totalSales = 0;

workers.forEach(w=>{
totalSales += w.sales;
});

workers.sort(
(a,b)=>b.sales-a.sales
);

const ranking =
document.getElementById(
"rankingTable"
);

if(ranking){

ranking.innerHTML = "";

workers.forEach((w,i)=>{

ranking.innerHTML +=
`
<tr>
<td>${i+1}</td>
<td>${w.name}</td>
<td>₪${w.sales}</td>
<td>${w.orders}</td>
</tr>
`;

});

}

const deleteSelect =
document.getElementById(
"deleteWorkerSelect"
);

if(deleteSelect){

deleteSelect.innerHTML = "";

workers.forEach(worker=>{

deleteSelect.innerHTML +=
`
<option value="${worker.name}">
${worker.name}
</option>
`;

});

}

const totalSalesBox =
document.getElementById(
"totalSales"
);

if(totalSalesBox){

totalSalesBox.innerText =
"₪"+totalSales;

}

const bestWorker =
document.getElementById(
"bestWorker"
);

if(
bestWorker &&
workers.length
){

bestWorker.innerText =
workers[0].name;

}

}

// ======================
// RESET
// ======================

function resetSystem(){

if(
!confirm(
"לאפס את כל הנתונים?"
)
){
return;
}

for(let key in localStorage){

if(
key.startsWith(
"worker_"
)
){

localStorage.setItem(

key,

JSON.stringify({

sales:0,
orders:0

})

);

}

}

updateManager();

alert(
"המערכת אופסה"
);

}

function deleteWorker(){

const worker =
document.getElementById(
"deleteWorkerSelect"
).value;

if(!worker){
return;
}

if(
!confirm(
`למחוק את ${worker}?`
)
){
return;
}

localStorage.removeItem(
"worker_"+worker
);

if(
localStorage.getItem(
"currentWorker"
) === worker
){

localStorage.removeItem(
"currentWorker"
);

}

updateManager();

alert(
"העובד נמחק"
);

}

const canvas =
document.getElementById(
"signatureCanvas"
);

if(canvas){

const ctx =
canvas.getContext("2d");

let drawing = false;

canvas.addEventListener(
"mousedown",
()=>{
drawing = true;
});

canvas.addEventListener(
"mouseup",
()=>{
drawing = false;
ctx.beginPath();
});

canvas.addEventListener(
"mousemove",
draw
);

canvas.addEventListener(
"touchstart",
()=>{
drawing = true;
}
);

canvas.addEventListener(
"touchmove",
drawTouch
);

canvas.addEventListener(
"touchend",
()=>{
drawing = false;
ctx.beginPath();
}
);

window.canvas = canvas;
window.ctx = ctx;
window.drawing = drawing;

}

function drawTouch(e){

if(!drawing) return;

e.preventDefault();

const rect =
canvas.getBoundingClientRect();

const touch =
e.touches[0];

ctx.lineWidth = 3;
ctx.lineCap = "round";
ctx.strokeStyle = "#000";

ctx.lineTo(
touch.clientX - rect.left,
touch.clientY - rect.top
);

ctx.stroke();

ctx.beginPath();

ctx.moveTo(
touch.clientX - rect.left,
touch.clientY - rect.top
);

}

function draw(e){

if(!drawing) return;

const rect =
canvas.getBoundingClientRect();

ctx.lineWidth = 3;
ctx.lineCap = "round";
ctx.strokeStyle = "#000";

ctx.lineTo(
e.clientX - rect.left,
e.clientY - rect.top
);

ctx.stroke();

ctx.beginPath();

ctx.moveTo(
e.clientX - rect.left,
e.clientY - rect.top
);

}

function clearSignature(){

const canvas =
document.getElementById(
"signatureCanvas"
);

const ctx =
canvas.getContext("2d");

ctx.clearRect(
0,
0,
canvas.width,
canvas.height
);

}

async function shareReceipt(){

const receipt =
document.getElementById(
"invoicePreview"
);

const canvas =
await html2canvas(receipt);

canvas.toBlob(async(blob)=>{

const file =
new File(

[blob],

"shawarma-dabush.png",

{
type:"image/png"
}

);

if(
navigator.canShare &&
navigator.canShare({
files:[file]
})
){

await navigator.share({

title:
" חשבונית שווארמה דבוש 🌯",

files:[file]

});

}else{

alert(
"המכשיר לא תומך בשיתוף"
);

}

});

}