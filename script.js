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
const contactsCol = collection(db, "contacts");
const lorriesCol = collection(db, "lorries");

let editRecordId = null;

/* ===========================
   REALTIME RECORDS
   SORT BY soNum DESC
=========================== */
const q = query(recordsCol, orderBy("soNum", "desc"));

onSnapshot(q, snap => {
  recordTable.innerHTML = "";

  snap.forEach(d => {
    const r = d.data();

    // Handle both old and new data formats safely
    const lorry = r.lorry || r.lorryText || "-";
    const driver = r.driver || r.driverText || "-";
    const helper = r.helper || r.helperText || "-";

    recordTable.innerHTML += `
      <tr>
        <td>${r.so || "-"}</td>
        <td>${lorry}</td>
        <td>${driver}</td>
        <td>${helper}</td>
        <td>${r.start || "-"}</td>
        <td>${r.end || "-"}</td>
        <td>${r.days || "-"}</td>
        <td>
          <button onclick="editRec('${d.id}')">✏</button>
          <button onclick="shareWA('${d.id}')">🟢</button>
          <button onclick="deleteRec('${d.id}')">❌</button>
        </td>
      </tr>
    `;
  });
});

/* ===========================
   SAVE RECORD
=========================== */
recordForm.onsubmit = async e => {
  e.preventDefault();

  const soNumberValue = Number(soNumber.value);
  const soText = "SO-" + soNumberValue;

  const start = startDate.value;
  const end = endDate.value;

  const rec = {
    so: soText,
    soNum: soNumberValue,
    lorry: lorrySelect.options[lorrySelect.selectedIndex].text,
    driver: driverSelect.options[driverSelect.selectedIndex].text,
    helper: helperSelect.options[helperSelect.selectedIndex].text,
    start,
    end: end || "",
    days: end
      ? Math.ceil((new Date(end) - new Date(start)) / 86400000) + 1
      : "In Progress"
  };

  if (editRecordId) {
    await updateDoc(doc(db, "records", editRecordId), rec);
  } else {
    await addDoc(recordsCol, rec);
  }

  editRecordId = null;
  closeRecord();
};

/* ===========================
   DELETE
=========================== */
window.deleteRec = async id => {
  if (confirm("Delete this record?")) {
    await deleteDoc(doc(db, "records", id));
  }
};

/* ===========================
   EDIT
=========================== */
window.editRec = async id => {
  const snap = await getDoc(doc(db, "records", id));
  const r = snap.data();

  soNumber.value = r.soNum || "";
  startDate.value = r.start || "";
  endDate.value = r.end || "";

  editRecordId = id;
  recordModal.style.display = "block";
};

/* ===========================
   WHATSAPP SHARE
=========================== */
window.shareWA = async id => {
  const snap = await getDoc(doc(db, "records", id));
  const r = snap.data();

  const lorry = r.lorry || r.lorryText || "-";
  const driver = r.driver || r.driverText || "-";
  const helper = r.helper || r.helperText || "-";

  const msg = `Loading Details
${r.so || ""}
Lorry - ${lorry}
Driver - ${driver}
Helper - ${helper}
Start - ${r.start || "-"}
End - ${r.end || "In Progress"}`;

  window.open("https://wa.me/?text=" + encodeURIComponent(msg));
};

/* ===========================
   MODAL CONTROLS
=========================== */
window.openFormBtn.onclick = () => recordModal.style.display = "block";
window.closeRecord = () => recordModal.style.display = "none";
window.manageContactsBtn.onclick = () => contactModal.style.display = "block";
window.manageLorriesBtn.onclick = () => lorryModal.style.display = "block";
window.closeContacts = () => contactModal.style.display = "none";
window.closeLorries = () => lorryModal.style.display = "none";
