
import { initializeApp } from "https://www.gstatic.com/firebasejs/10.7.1/firebase-app.js";
import {
  getFirestore, collection, addDoc,
  getDocs, doc, getDoc, updateDoc, onSnapshot
} from "https://www.gstatic.com/firebasejs/10.7.1/firebase-firestore.js";

const firebaseConfig = {
  apiKey: "YOUR_API_KEY",
  authDomain: "YOUR_AUTH_DOMAIN",
  projectId: "YOUR_PROJECT_ID"
};

const app = initializeApp(firebaseConfig);
const db = getFirestore(app);
const costsCol = collection(db, "costs");

const SYSTEM_PIN = "1234";

const loginBtn = document.getElementById("loginBtn");
const pinInput = document.getElementById("pinInput");
const loginScreen = document.getElementById("loginScreen");
const appDiv = document.getElementById("app");

loginBtn.onclick = () => {
  if(pinInput.value === SYSTEM_PIN){
    loginScreen.style.display="none";
    appDiv.style.display="block";
  } else {
    document.getElementById("loginError").innerText="Wrong PIN";
  }
};

const costTable = document.getElementById("costTable");

onSnapshot(costsCol, snap => {
  costTable.innerHTML = "";
  snap.forEach(d => {
    const c = d.data();
    costTable.innerHTML += `
      <tr>
        <td>${c.so}</td>
        <td>${c.totalCost}</td>
        <td>${c.ppcCost}</td>
        <td>${c.ecCost}</td>
        <td><button onclick="editCost('${d.id}')">Edit</button></td>
      </tr>`;
  });
});

document.getElementById("exportExcelBtn").onclick = async () => {

  const snapshot = await getDocs(costsCol);
  const excelData = [];

  snapshot.forEach(doc => {
    const c = doc.data();
    excelData.push({
      SO: c.so,
      Amount: c.amount,
      Advance: c.advanceTotal,
      Final: c.finalTotal,
      Total: c.totalCost,
      PPC: c.ppcCost,
      EC: c.ecCost
    });
  });

  const worksheet = XLSX.utils.json_to_sheet(excelData);
  const workbook = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(workbook, worksheet, "SO Costs");
  XLSX.writeFile(workbook, "SO_Cost_Report.xlsx");
};
