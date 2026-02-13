import { db } from "./firebase.js";
import {
  collection,
  addDoc,
  onSnapshot,
  doc,
  getDoc
} from "https://www.gstatic.com/firebasejs/10.7.1/firebase-firestore.js";

/* DOM */
const recordTable = document.getElementById("recordTable");
const driverSelect = document.getElementById("driverSelect");
const helperSelect = document.getElementById("helperSelect");
const lorrySelect = document.getElementById("lorrySelect");

const openFormBtn = document.getElementById("openFormBtn");

/* Collections */
const recordsCol = collection(db,"records");
const contactsCol = collection(db,"contacts");
const lorriesCol = collection(db,"lorries");

/* TEST BUTTON */
openFormBtn.onclick = () => {
  alert("Button working");
};

/* LOAD CONTACTS */
onSnapshot(contactsCol, snap => {

  driverSelect.innerHTML = "";
  helperSelect.innerHTML = "";

  snap.forEach(d => {
    const c = d.data();

    if (c.type === "driver")
      driverSelect.innerHTML += `<option value="${d.id}">${c.name}</option>`;

    if (c.type === "helper")
      helperSelect.innerHTML += `<option value="${d.id}">${c.name}</option>`;
  });

});

/* LOAD LORRIES */
onSnapshot(lorriesCol, snap => {

  lorrySelect.innerHTML = "";

  snap.forEach(d => {
    const l = d.data();
    lorrySelect.innerHTML += `<option value="${d.id}">${l.number}</option>`;
  });

});

/* LOAD RECORDS */
onSnapshot(recordsCol, async snap => {

  recordTable.innerHTML = "";

  for (const d of snap.docs) {

    const r = d.data();

    let driverName = "-";
    let helperName = "-";
    let lorryNumber = "-";

    if (r.driverId) {
      const driverDoc = await getDoc(doc(db,"contacts",r.driverId));
      driverName = driverDoc.exists() ? driverDoc.data().name : "-";
    }

    if (r.helperId) {
      const helperDoc = await getDoc(doc(db,"contacts",r.helperId));
      helperName = helperDoc.exists() ? helperDoc.data().name : "-";
    }

    if (r.lorryId) {
      const lorryDoc = await getDoc(doc(db,"lorries",r.lorryId));
      lorryNumber = lorryDoc.exists() ? lorryDoc.data().number : "-";
    }

    recordTable.innerHTML += `
      <tr>
        <td>${r.so || "-"}</td>
        <td>${lorryNumber}</td>
        <td>${driverName}</td>
        <td>${helperName}</td>
      </tr>
    `;
  }

});
