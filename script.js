import { db } from "./firebase.js";
import {
  collection,
  addDoc,
  deleteDoc,
  doc,
  updateDoc,
  onSnapshot,
  getDoc,
  query,
  orderBy
} from "https://www.gstatic.com/firebasejs/10.7.1/firebase-firestore.js";

const recordsCol = collection(db, "records");
const lorriesCol = collection(db, "lorries");
const contactsCol = collection(db, "contacts");

const recordTable = document.getElementById("recordTable");
const modal = document.getElementById("recordModal");

document.getElementById("openFormBtn").onclick = () => {
  modal.style.display = "flex";
};

window.closeModal = () => {
  modal.style.display = "none";
  recordForm.reset();
};

/* LOAD DROPDOWNS */
onSnapshot(lorriesCol, snap => {
  lorrySelect.innerHTML = "";
  snap.forEach(d => {
    lorrySelect.innerHTML += `<option value="${d.data().number}">${d.data().number}</option>`;
  });
});

onSnapshot(contactsCol, snap => {
  driverSelect.innerHTML = "";
  helperSelect.innerHTML = "";
  snap.forEach(d => {
    const c = d.data();
    if (c.type === "driver")
      driverSelect.innerHTML += `<option value="${c.name}">${c.name}</option>`;
    if (c.type === "helper")
      helperSelect.innerHTML += `<option value="${c.name}">${c.name}</option>`;
  });
});

/* LOAD RECORDS SORTED DESC */
const q = query(recordsCol, orderBy("so", "desc"));

onSnapshot(q, snap => {
  recordTable.innerHTML = "";
  snap.forEach(docSnap => {
    const r = docSnap.data();
    recordTable.innerHTML += `
      <tr>
        <td>${r.so}</td>
        <td>${r.lorry}</td>
        <td>${r.driver}</td>
        <td>${r.helper}</td>
        <td>${r.start}</td>
        <td>${r.end || "-"}</td>
        <td>${r.days}</td>
        <td>
          <button onclick="deleteRec('${docSnap.id}')">❌</button>
        </td>
      </tr>
    `;
  });
});

/* SAVE */
recordForm.onsubmit = async e => {
  e.preventDefault();

  const start = startDate.value;
  const end = endDate.value;

  const data = {
    so: Number(soNumber.value),
    lorry: lorrySelect.value,
    driver: driverSelect.value,
    helper: helperSelect.value,
    start,
    end: end || "",
    days: end
      ? Math.ceil((new Date(end) - new Date(start)) / 86400000) + 1
      : "In Progress"
  };

  await addDoc(recordsCol, data);
  closeModal();
};

window.deleteRec = async id => {
  if (confirm("Delete this record?")) {
    await deleteDoc(doc(db, "records", id));
  }
};
