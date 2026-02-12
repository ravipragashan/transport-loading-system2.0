import { db } from "./firebase.js";
import {
  collection,
  addDoc,
  deleteDoc,
  doc,
  updateDoc,
  onSnapshot,
  getDoc,
  getDocs,
  query,
  orderBy
} from "https://www.gstatic.com/firebasejs/10.7.1/firebase-firestore.js";

const recordsCol = collection(db,"records");
const contactsCol = collection(db,"contacts");
const lorriesCol = collection(db,"lorries");

let editRecordId = null;

/* =========================
   LOAD CONTACTS (REALTIME)
========================= */
onSnapshot(contactsCol, snap => {

  driverSelect.innerHTML = "";
  helperSelect.innerHTML = "";
  contactTable.innerHTML = "";

  snap.forEach(d => {
    const c = d.data();

    // Dropdowns
    if (c.type === "driver") {
      driverSelect.innerHTML +=
        `<option value="${c.name}">
          ${c.name} (${c.phone})
        </option>`;
    }

    if (c.type === "helper") {
      helperSelect.innerHTML +=
        `<option value="${c.name}">
          ${c.name} (${c.phone})
        </option>`;
    }

    // Contact modal table
    contactTable.innerHTML += `
      <tr>
        <td>${c.name}</td>
        <td>${c.phone}</td>
        <td>${c.type}</td>
        <td>
          <button onclick="deleteContact('${d.id}')">❌</button>
        </td>
      </tr>`;
  });
});

/* =========================
   LOAD LORRIES (REALTIME)
========================= */
onSnapshot(lorriesCol, snap => {

  lorrySelect.innerHTML = "";
  lorryTable.innerHTML = "";

  snap.forEach(d => {
    const l = d.data();

    lorrySelect.innerHTML +=
      `<option value="${l.number}">
        ${l.number}
      </option>`;

    lorryTable.innerHTML += `
      <tr>
        <td>${l.number}</td>
        <td>
          <button onclick="deleteLorry('${d.id}')">❌</button>
        </td>
      </tr>`;
  });
});

/* =========================
   LOAD RECORDS (SORT DESC)
========================= */
const q = query(recordsCol, orderBy("soNum","desc"));

onSnapshot(q, snap => {

  recordTable.innerHTML = "";

  snap.forEach(d => {
    const r = d.data();

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
          <button onclick="editRec('${d.id}')">✏</button>
          <button onclick="shareWA('${d.id}')">🟢</button>
          <button onclick="deleteRec('${d.id}')">❌</button>
        </td>
      </tr>`;
  });

});

/* =========================
   SAVE RECORD
========================= */
recordForm.onsubmit = async e => {
  e.preventDefault();

  const soNum = Number(soNumber.value);

  const rec = {
    so: "SO-" + soNum,
    soNum: soNum,
    lorry: lorrySelect.value,
    driver: driverSelect.value,
    helper: helperSelect.value,
    start: startDate.value,
    end: endDate.value || "",
    days: endDate.value
      ? Math.ceil((new Date(endDate.value) - new Date(startDate.value)) / 86400000) + 1
      : "In Progress"
  };

  if (editRecordId)
    await updateDoc(doc(db,"records",editRecordId),rec);
  else
    await addDoc(recordsCol,rec);

  editRecordId = null;
  closeRecord();
};

/* =========================
   SAVE CONTACT
========================= */
window.saveContact = async () => {

  const data = {
    type: contactType.value,
    name: contactName.value.trim(),
    phone: contactPhone.value.trim()
  };

  if (!data.name || !data.phone) {
    alert("Name and phone required");
    return;
  }

  await addDoc(contactsCol, data);

  contactName.value = "";
  contactPhone.value = "";
};

/* =========================
   SAVE LORRY
========================= */
window.saveLorry = async () => {

  if (!lorryNumber.value.trim()) {
    alert("Lorry number required");
    return;
  }

  await addDoc(lorriesCol, {
    number: lorryNumber.value.trim()
  });

  lorryNumber.value = "";
};

/* =========================
   DELETE FUNCTIONS
========================= */
window.deleteRec = id =>
  deleteDoc(doc(db,"records",id));

window.deleteContact = id =>
  deleteDoc(doc(db,"contacts",id));

window.deleteLorry = id =>
  deleteDoc(doc(db,"lorries",id));

/* =========================
   WHATSAPP SHARE
========================= */
window.shareWA = async id => {

  const snap = await getDoc(doc(db,"records",id));
  const r = snap.data();

  const contactsSnap = await getDocs(contactsCol);

  let driverPhone = "";
  let helperPhone = "";

  contactsSnap.forEach(d => {
    const c = d.data();
    if (c.name === r.driver) driverPhone = c.phone;
    if (c.name === r.helper) helperPhone = c.phone;
  });

  const dateObj = new Date(r.start);
  const formattedDate =
    dateObj.getDate() + "-" +
    (dateObj.getMonth()+1) + "-" +
    dateObj.getFullYear();

  const msg =
`${formattedDate} Loaded
Order Number - ${r.so}
Lorry Number: ${r.lorry}
Driver :- ${r.driver} - ${driverPhone}
Poter :- ${r.helper} - ${helperPhone}`;

  window.open("https://wa.me/?text="+encodeURIComponent(msg));
};

/* =========================
   MODAL CONTROLS
========================= */
window.openFormBtn.onclick = () =>
  recordModal.style.display = "block";

window.closeRecord = () =>
  recordModal.style.display = "none";

window.manageContactsBtn.onclick = () =>
  contactModal.style.display = "block";

window.manageLorriesBtn.onclick = () =>
  lorryModal.style.display = "block";

window.closeContacts = () =>
  contactModal.style.display = "none";

window.closeLorries = () =>
  lorryModal.style.display = "none";
