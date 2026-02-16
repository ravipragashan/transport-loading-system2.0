import { db } from "./firebase.js";
import {
  collection,
  addDoc,
  deleteDoc,
  doc,
  getDoc,
  updateDoc,
  onSnapshot
} from "https://www.gstatic.com/firebasejs/10.7.1/firebase-firestore.js";

/* ================= DOM ================= */

const recordTable = document.getElementById("recordTable");
const recordForm = document.getElementById("recordForm");

const driverSelect = document.getElementById("driverSelect");
const helperSelect = document.getElementById("helperSelect");
const lorrySelect = document.getElementById("lorrySelect");

const contactTable = document.getElementById("contactTable");
const lorryTable = document.getElementById("lorryTable");

const soNumber = document.getElementById("soNumber");
const startDate = document.getElementById("startDate");
const endDate = document.getElementById("endDate");

const contactType = document.getElementById("contactType");
const contactName = document.getElementById("contactName");
const contactPhone = document.getElementById("contactPhone");

const lorryNumber = document.getElementById("lorryNumber");

const recordModal = document.getElementById("recordModal");
const openFormBtn = document.getElementById("openFormBtn");

/* ================= COLLECTIONS ================= */

const recordsCol = collection(db,"records");
const contactsCol = collection(db,"contacts");
const lorriesCol = collection(db,"lorries");

/* ================= CONTACTS ================= */

let editContactId = null;

onSnapshot(contactsCol, snap => {

  driverSelect.innerHTML = "";
  helperSelect.innerHTML = "";
  contactTable.innerHTML = "";

  snap.forEach(d => {
    const c = d.data();

    if(c.type === "driver")
      driverSelect.innerHTML += `<option value="${d.id}">${c.name}</option>`;

    if(c.type === "helper")
      helperSelect.innerHTML += `<option value="${d.id}">${c.name}</option>`;

    contactTable.innerHTML += `
      <tr>
        <td>${c.name}</td>
        <td>${c.phone}</td>
        <td>${c.type}</td>
        <td>
          <button onclick="editContact('${d.id}','${c.name}','${c.phone}','${c.type}')">✏</button>
          <button onclick="deleteContact('${d.id}')">❌</button>
        </td>
      </tr>`;
  });

});

window.editContact = (id,name,phone,type)=>{
  editContactId = id;
  contactName.value = name;
  contactPhone.value = phone;
  contactType.value = type;
};

window.saveContact = async ()=>{
  const data = {
    type: contactType.value,
    name: contactName.value,
    phone: contactPhone.value
  };

  if(editContactId){
    await updateDoc(doc(db,"contacts",editContactId),data);
    editContactId = null;
  } else {
    await addDoc(contactsCol,data);
  }

  contactName.value="";
  contactPhone.value="";
};

window.deleteContact = id =>
  deleteDoc(doc(db,"contacts",id));

/* ================= LORRIES ================= */

onSnapshot(lorriesCol, snap=>{

  lorrySelect.innerHTML="";
  lorryTable.innerHTML="";

  snap.forEach(d=>{
    const l=d.data();

    lorrySelect.innerHTML+=`<option value="${d.id}">${l.number}</option>`;

    lorryTable.innerHTML+=`
      <tr>
        <td>${l.number}</td>
        <td><button onclick="deleteLorry('${d.id}')">❌</button></td>
      </tr>`;
  });

});

window.saveLorry = async ()=>{
  if(!lorryNumber.value) return;
  await addDoc(lorriesCol,{number:lorryNumber.value});
  lorryNumber.value="";
};

window.deleteLorry = id =>
  deleteDoc(doc(db,"lorries",id));

/* ================= RECORDS ================= */

let editRecordId = null;

onSnapshot(recordsCol, async snap => {

  recordTable.innerHTML="";

  for(const d of snap.docs){

    const r = d.data();

    // Works for old + new format
    let driver = r.driverText || r.driver || "-";
    let helper = r.helperText || r.helper || "-";
    let lorry = r.lorryText || r.lorry || "-";

    if(r.driverId){
      const driverDoc = await getDoc(doc(db,"contacts",r.driverId));
      if(driverDoc.exists()) driver = driverDoc.data().name;
    }

    if(r.helperId){
      const helperDoc = await getDoc(doc(db,"contacts",r.helperId));
      if(helperDoc.exists()) helper = helperDoc.data().name;
    }

    if(r.lorryId){
      const lorryDoc = await getDoc(doc(db,"lorries",r.lorryId));
      if(lorryDoc.exists()) lorry = lorryDoc.data().number;
    }

    recordTable.innerHTML+=`
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
      </tr>`;
  }

});

/* ================= ADD / EDIT RECORD ================= */

openFormBtn.onclick = ()=>{
  editRecordId = null;
  recordForm.reset();
  recordModal.style.display="flex";
};

window.editRec = async (id)=>{

  const snap = await getDoc(doc(db,"records",id));
  const r = snap.data();

  editRecordId = id;

  soNumber.value = (r.so || "").replace("SO-","");
  startDate.value = r.start || "";
  endDate.value = r.end || "";

  driverSelect.value = r.driverId || "";
  helperSelect.value = r.helperId || "";
  lorrySelect.value = r.lorryId || "";

  recordModal.style.display="flex";
};

recordForm.onsubmit = async e=>{
  e.preventDefault();

  const soVal = soNumber.value;

  const data = {
    so: "SO-"+soVal,
    driverId: driverSelect.value || null,
    helperId: helperSelect.value || null,
    lorryId: lorrySelect.value || null,
    start: startDate.value,
    end: endDate.value || "",
    days: endDate.value
      ? Math.ceil((new Date(endDate.value)-new Date(startDate.value))/86400000)+1
      : "In Progress"
  };

  if(editRecordId){
    await updateDoc(doc(db,"records",editRecordId),data);
    editRecordId = null;
  } else {
    await addDoc(recordsCol,data);
  }

  recordModal.style.display="none";
};

window.deleteRec = id =>
  deleteDoc(doc(db,"records",id));

/* ================= WHATSAPP ================= */

window.shareWA = async id=>{

  const r = (await getDoc(doc(db,"records",id))).data();

  let driver = r.driverText || r.driver || "";
  let helper = r.helperText || r.helper || "";
  let lorry = r.lorryText || r.lorry || "";

  if(r.driverId){
    const driverDoc = await getDoc(doc(db,"contacts",r.driverId));
    if(driverDoc.exists()){
      const d = driverDoc.data();
      driver = `${d.name} - ${d.phone}`;
    }
  }

  if(r.helperId){
    const helperDoc = await getDoc(doc(db,"contacts",r.helperId));
    if(helperDoc.exists()){
      const h = helperDoc.data();
      helper = `${h.name} - ${h.phone}`;
    }
  }

  if(r.lorryId){
    const lorryDoc = await getDoc(doc(db,"lorries",r.lorryId));
    if(lorryDoc.exists()){
      lorry = lorryDoc.data().number;
    }
  }

  const d = new Date(r.start);
  const date = `${d.getDate()}-${d.getMonth()+1}-${d.getFullYear()}`;

  const msg =
`${date} Loaded
Order Number - ${r.so}
Lorry Number: ${lorry}
Driver :- ${driver}
Poter :- ${helper}`;

  window.open("https://wa.me/?text="+encodeURIComponent(msg));
};

window.closeRecord = ()=> recordModal.style.display="none";
