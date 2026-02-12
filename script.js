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
let allData = [];

const modal = document.getElementById("recordModal");
const table = document.getElementById("recordTable");
const loader = document.getElementById("loader");

document.getElementById("openFormBtn").onclick = () => {
  modal.style.display = "flex";
};

window.closeModal = () => {
  modal.style.display = "none";
  recordForm.reset();
  editId = null;
};

/* REALTIME LISTENER */
loader.style.display = "block";

onSnapshot(recordsCol, (snapshot) => {
  allData = [];
  snapshot.forEach((docSnap) => {
    allData.push({ id: docSnap.id, ...docSnap.data() });
  });
  renderTable(allData);
  loader.style.display = "none";
});

/* RENDER */
function renderTable(data) {
  table.innerHTML = "";
  data.forEach((r) => {
    table.innerHTML += `
      <tr>
        <td>${r.so}</td>
        <td>${r.lorry}</td>
        <td>${r.driver}</td>
        <td>${r.helper}</td>
        <td>${r.start}</td>
        <td>${r.end || "-"}</td>
        <td>${r.days}</td>
        <td>
          <button onclick="editRec('${r.id}')">✏</button>
          <button onclick="shareWA('${r.id}')">🟢</button>
          <button onclick="deleteRec('${r.id}')">❌</button>
        </td>
      </tr>
    `;
  });
}

/* SAVE */
recordForm.onsubmit = async (e) => {
  e.preventDefault();

  const start = startDate.value;
  const end = endDate.value;

  if (end && new Date(end) < new Date(start)) {
    alert("End date cannot be before start date");
    return;
  }

  const data = {
    so: soNumber.value.trim(),
    lorry: lorry.value.trim(),
    driver: driver.value.trim(),
    helper: helper.value.trim(),
    start,
    end: end || "",
    days: end
      ? Math.ceil((new Date(end) - new Date(start)) / 86400000) + 1
      : "In Progress",
    createdAt: new Date()
  };

  if (editId) {
    await updateDoc(doc(db, "records", editId), data);
  } else {
    await addDoc(recordsCol, data);
  }

  closeModal();
};

/* DELETE */
window.deleteRec = async (id) => {
  if (confirm("Delete this record?")) {
    await deleteDoc(doc(db, "records", id));
  }
};

/* EDIT */
window.editRec = async (id) => {
  const snap = await getDoc(doc(db, "records", id));
  const r = snap.data();

  soNumber.value = r.so;
  lorry.value = r.lorry;
  driver.value = r.driver;
  helper.value = r.helper;
  startDate.value = r.start;
  endDate.value = r.end;

  editId = id;
  modal.style.display = "flex";
};

/* SEARCH */
document.getElementById("searchInput").addEventListener("input", (e) => {
  const value = e.target.value.toLowerCase();
  const filtered = allData.filter(r =>
    r.so.toLowerCase().includes(value) ||
    r.driver.toLowerCase().includes(value) ||
    r.lorry.toLowerCase().includes(value)
  );
  renderTable(filtered);
});

/* WHATSAPP */
window.shareWA = async (id) => {
  const snap = await getDoc(doc(db, "records", id));
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
