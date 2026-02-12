import { db } from "./firebase.js";
import {
  collection,
  addDoc,
  deleteDoc,
  doc,
  updateDoc,
  onSnapshot,
  getDoc
} from "https://www.gstatic.com/firebasejs/10.7.1/firebase-firestore.js";

const recordsCol = collection(db, "records");

let editId = null;

const recordModal = document.getElementById("recordModal");
const recordForm = document.getElementById("recordForm");
const recordTable = document.getElementById("recordTable");

document.getElementById("openFormBtn").onclick = () => {
  recordModal.style.display = "flex";
};

window.closeRecord = () => {
  recordModal.style.display = "none";
  recordForm.reset();
  editId = null;
};

/* REALTIME LISTENER */
onSnapshot(recordsCol, (snapshot) => {
  recordTable.innerHTML = "";
  snapshot.forEach((docSnap) => {
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
          <button onclick="editRec('${docSnap.id}')">✏</button>
          <button onclick="shareWA('${docSnap.id}')">🟢</button>
          <button onclick="deleteRec('${docSnap.id}')">❌</button>
        </td>
      </tr>
    `;
  });
});

/* SAVE RECORD */
recordForm.onsubmit = async (e) => {
  e.preventDefault();

  const start = startDate.value;
  const end = endDate.value;

  const data = {
    so: soNumber.value,
    lorry: lorrySelect.value,
    driver: driverSelect.value,
    helper: helperSelect.value,
    start,
    end: end || "",
    days: end
      ? Math.ceil((new Date(end) - new Date(start)) / 86400000) + 1
      : "In Progress"
  };

  if (editId) {
    await updateDoc(doc(db, "records", editId), data);
  } else {
    await addDoc(recordsCol, data);
  }

  closeRecord();
};

/* DELETE */
window.deleteRec = async (id) => {
  await deleteDoc(doc(db, "records", id));
};

/* EDIT */
window.editRec = async (id) => {
  const snap = await getDoc(doc(db, "records", id));
  const r = snap.data();

  soNumber.value = r.so;
  lorrySelect.value = r.lorry;
  driverSelect.value = r.driver;
  helperSelect.value = r.helper;
  startDate.value = r.start;
  endDate.value = r.end;

  editId = id;
  recordModal.style.display = "flex";
};

/* WHATSAPP SHARE (Optimized) */
window.shareWA = async (id) => {
  const snap = await getDoc(doc(db, "records", id));
  if (!snap.exists()) return;

  const r = snap.data();

  const msg = `
Loading Details
SO - ${r.so}
Lorry - ${r.lorry}
Driver - ${r.driver}
Helper - ${r.helper}
Start - ${r.start}
End - ${r.end || "In Progress"}
`;

  window.open("https://wa.me/?text=" + encodeURIComponent(msg));
};
