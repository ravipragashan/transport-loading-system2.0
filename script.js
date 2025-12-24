import { db } from "./firebase.js";
import {
  collection,
  addDoc,
  getDocs,
  deleteDoc,
  doc,
  updateDoc
} from "https://www.gstatic.com/firebasejs/10.7.1/firebase-firestore.js";

const recordsCol = collection(db, "records");
const contactsCol = collection(db, "contacts");

let tempDocs = [];
let editRecordId = null;   // 🔴 THIS WAS MISSING

/* ---------------- RECORDS ---------------- */
async function loadRecords() {
  recordTable.innerHTML = "";
  const snap = await getDocs(recordsCol);
  const rows = [];
  snap.forEach(d => rows.push({ id: d.id, ...d.data() }));
  rows.sort((a, b) => b.soNum - a.soNum);

  rows.forEach(r => {
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
          <button onclick="editRecord('${r.id}')">✏️</button>
          <button onclick="shareWA('${r.id}')">🟢</button>
          <button onclick="deleteRecord('${r.id}')">❌</button>
        </td>
      </tr>`;
  });
}

/* ADD / UPDATE RECORD */
recordForm.onsubmit = async e => {
  e.preventDefault();

  const [dn, dp] = driverSelect.value.split("|");
  const [hn, hp] = helperSelect.value.split("|");

  const data = {
    so: soNumber.value,
    soNum: +soNumber.value.replace(/\D/g, ""),
    lorry: lorryNumber.value,
    driver: dn,
    dPhone: dp,
    helper: hn,
    hPhone: hp,
    start: startDate.value,
    end: endDate.value || "",
    days: endDate.value
      ? Math.ceil(
          (new Date(endDate.value) - new Date(startDate.value)) / 86400000
        ) + 1
      : "In Progress",
    docs: tempDocs
  };

  if (editRecordId) {
    // 🔁 UPDATE
    await updateDoc(doc(db, "records", editRecordId), data);
  } else {
    // ➕ ADD
    await addDoc(recordsCol, data);
  }

  closeRecord();
  loadRecords();
};

/* EDIT RECORD */
window.editRecord = async id => {
  editRecordId = id;

  const snap = await getDocs(recordsCol);
  snap.forEach(d => {
    if (d.id === id) {
      const r = d.data();

      soNumber.value = r.so;
      lorryNumber.value = r.lorry;
      startDate.value = r.start;
      endDate.value = r.end || "";

      tempDocs = r.docs || [];
      renderDocs();
    }
  });

  recordModal.style.display = "block";
};

/* DELETE RECORD */
window.deleteRecord = async id => {
  if (!confirm("Delete this record?")) return;
  await deleteDoc(doc(db, "records", id));
  loadRecords();
};

/* ---------------- CONTACTS ---------------- */
async function loadContacts() {
  driverSelect.innerHTML = "";
  helperSelect.innerHTML = "";
  contactTable.innerHTML = "";

  const snap = await getDocs(contactsCol);
  snap.forEach(d => {
    const c = d.data();
    const opt = `${c.name}|${c.phone}`;

    if (c.type === "driver")
      driverSelect.innerHTML += `<option>${opt}</option>`;
    if (c.type === "helper")
      helperSelect.innerHTML += `<option>${opt}</option>`;

    contactTable.innerHTML += `
      <tr>
        <td>${c.name}</td>
        <td>${c.phone}</td>
        <td>
          <button onclick="deleteContact('${d.id}')">❌</button>
        </td>
      </tr>`;
  });
}

window.saveContact = async () => {
  if (!contactName.value || !contactPhone.value) return;

  await addDoc(contactsCol, {
    type: contactType.value,
    name: contactName.value,
    phone: contactPhone.value
  });

  contactName.value = contactPhone.value = "";
  loadContacts();
};

window.deleteContact = async id => {
  await deleteDoc(doc(db, "contacts", id));
  loadContacts();
};

/* ---------------- DOCS ---------------- */
docInput.onchange = () => {
  [...docInput.files].forEach(f => tempDocs.push(f.name));
  renderDocs();
};

function renderDocs() {
  docList.innerHTML = tempDocs
    .map(
      (d, i) => `<li>${d}<button onclick="removeDoc(${i})">❌</button></li>`
    )
    .join("");
}

window.removeDoc = i => {
  tempDocs.splice(i, 1);
  renderDocs();
};

/* ---------------- WHATSAPP ---------------- */
window.shareWA = async id => {
  const snap = await getDocs(recordsCol);
  snap.forEach(d => {
    if (d.id === id) {
      const r = d.data();
      const msg = `"${r.start}" Loaded
Order Number - ${r.so}
Lorry Number - ${r.lorry}
Driver - ${r.driver} - ${r.dPhone}
Poter - ${r.helper} - ${r.hPhone}`;
      window.open("https://wa.me/?text=" + encodeURIComponent(msg));
    }
  });
};

/* ---------------- UI ---------------- */
window.closeRecord = () => {
  recordModal.style.display = "none";
  editRecordId = null;      // 🔴 RESET EDIT STATE
};

window.closeContacts = () => {
  contactModal.style.display = "none";
};

openFormBtn.onclick = () => {
  editRecordId = null;
  tempDocs = [];
  docList.innerHTML = "";
  recordForm.reset();
  recordModal.style.display = "block";
};

manageContactsBtn.onclick = () => {
  contactModal.style.display = "block";
};

/* INIT */
loadContacts();
loadRecords();
