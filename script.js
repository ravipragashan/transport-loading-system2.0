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

document.addEventListener("DOMContentLoaded", () => {

  const recordsCol = collection(db,"records");
  const contactsCol = collection(db,"contacts");
  const lorriesCol = collection(db,"lorries");

  const driverSelect = document.getElementById("driverSelect");
  const helperSelect = document.getElementById("helperSelect");
  const lorrySelect = document.getElementById("lorrySelect");
  const contactTable = document.getElementById("contactTable");
  const lorryTable = document.getElementById("lorryTable");
  const recordTable = document.getElementById("recordTable");

  let editRecordId = null;

  /* ======================
     LOAD CONTACTS
  ====================== */
  onSnapshot(contactsCol, snap => {

    if (!driverSelect || !helperSelect) return;

    driverSelect.innerHTML = "";
    helperSelect.innerHTML = "";
    contactTable.innerHTML = "";

    snap.forEach(d => {
      const c = d.data();

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

  /* ======================
     LOAD LORRIES
  ====================== */
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

  /* ======================
     LOAD RECORDS
  ====================== */
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
            <button onclick="shareWA('${d.id}')">🟢</button>
            <button onclick="deleteRec('${d.id}')">❌</button>
          </td>
        </tr>`;
    });

  });

  /* SAVE CONTACT */
  window.saveContact = async () => {

    const type = document.getElementById("contactType").value;
    const name = document.getElementById("contactName").value.trim();
    const phone = document.getElementById("contactPhone").value.trim();

    if (!name || !phone) {
      alert("Name and phone required");
      return;
    }

    await addDoc(contactsCol, { type, name, phone });

    document.getElementById("contactName").value = "";
    document.getElementById("contactPhone").value = "";
  };

  /* SAVE LORRY */
  window.saveLorry = async () => {

    const number = document.getElementById("lorryNumber").value.trim();

    if (!number) {
      alert("Lorry number required");
      return;
    }

    await addDoc(lorriesCol, { number });

    document.getElementById("lorryNumber").value = "";
  };

  /* DELETE */
  window.deleteContact = id =>
    deleteDoc(doc(db,"contacts",id));

  window.deleteLorry = id =>
    deleteDoc(doc(db,"lorries",id));

  window.deleteRec = id =>
    deleteDoc(doc(db,"records",id));

});
