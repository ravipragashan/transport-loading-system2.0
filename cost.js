import { initializeApp } from "https://www.gstatic.com/firebasejs/10.7.1/firebase-app.js";
import {
  getFirestore,
  collection,
  addDoc,
  doc,
  getDoc,
  updateDoc,
  deleteDoc,
  onSnapshot
} from "https://www.gstatic.com/firebasejs/10.7.1/firebase-firestore.js";

/* 🔥 PUT YOUR REAL CONFIG HERE */
const firebaseConfig = {
  apiKey: "AIzaSyAcpkRglFpdgXPUyfOKDkP9tWTYY0d2tCc",
  authDomain: "transport-loading-system.firebaseapp.com",
  projectId: "transport-loading-system"
};

const app = initializeApp(firebaseConfig);
const db = getFirestore(app);

const soCol = collection(db, "soAllocation");

/* DOM */
const soTable = document.getElementById("soTable");
const mainModal = document.getElementById("mainModal");
const costModal = document.getElementById("costModal");
const expenseContainer = document.getElementById("expenseContainer");

let editId = null;
let currentCostType = "";

/* LOAD TABLE */
onSnapshot(soCol, snap => {
  soTable.innerHTML = "";

  snap.forEach(d => {
    const s = d.data();

    const totalCost = (s.advanceTotal || 0) + (s.finalTotal || 0);
    const totalCBM = (s.cbmPPC || 0) + (s.cbmEC || 0);

    const ppcAllocated = totalCBM > 0 ? (totalCost / totalCBM) * s.cbmPPC : 0;
    const ecAllocated = totalCBM > 0 ? (totalCost / totalCBM) * s.cbmEC : 0;

    soTable.innerHTML += `
      <tr>
        <td>${s.so}</td>
        <td>${s.amount}</td>
        <td>${s.cbmPPC}</td>
        <td>${s.cbmEC}</td>
        <td><button onclick="openCost('${d.id}','advance')">${s.advanceTotal || 0}</button></td>
        <td><button onclick="openCost('${d.id}','final')">${s.finalTotal || 0}</button></td>
        <td>${ppcAllocated.toFixed(2)}</td>
        <td>${ecAllocated.toFixed(2)}</td>
        <td><button onclick="editSO('${d.id}')">Edit</button></td>
      </tr>
    `;
  });
});

/* NEW SO */
document.getElementById("newSOBtn").onclick = () => {
  editId = null;
  document.getElementById("soInput").value = "";
  mainModal.style.display = "flex";
};

document.getElementById("closeMainBtn").onclick = () => {
  mainModal.style.display = "none";
};

/* SAVE MAIN */
document.getElementById("saveMainBtn").onclick = async () => {

  const data = {
    so: document.getElementById("soInput").value,
    amount: Number(document.getElementById("amountInput").value),
    cbmPPC: Number(document.getElementById("cbmPPCInput").value),
    cbmEC: Number(document.getElementById("cbmECInput").value),
    advanceTotal: 0,
    finalTotal: 0
  };

  if (editId) {
    await updateDoc(doc(db, "soAllocation", editId), data);
  } else {
    await addDoc(soCol, data);
  }

  mainModal.style.display = "none";
};

/* OPEN COST MODAL */
window.openCost = async (id, type) => {

  currentCostType = type;
  editId = id;
  expenseContainer.innerHTML = "";

  document.getElementById("costTitle").innerText =
    type === "advance" ? "Advance Costs" : "Final Costs";

  costModal.style.display = "flex";
};

document.getElementById("closeCostBtn").onclick = () => {
  costModal.style.display = "none";
};

/* ADD EXPENSE */
document.getElementById("addExpenseBtn").onclick = () => {
  const row = document.createElement("div");
  row.className = "expense-row";
  row.innerHTML = `
    <input placeholder="Expense">
    <input type="number" placeholder="Amount">
  `;
  expenseContainer.appendChild(row);
};

/* SAVE COST */
document.getElementById("saveCostBtn").onclick = async () => {

  let total = 0;

  expenseContainer.querySelectorAll(".expense-row").forEach(r => {
    total += Number(r.children[1].value || 0);
  });

  const updateData = currentCostType === "advance"
    ? { advanceTotal: total }
    : { finalTotal: total };

  await updateDoc(doc(db, "soAllocation", editId), updateData);

  costModal.style.display = "none";
};
