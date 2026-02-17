import { db } from "./firebase.js";
import {
  collection,
  addDoc,
  deleteDoc,
  doc,
  getDoc,
  updateDoc,
  onSnapshot,
  query,
  orderBy
} from "https://www.gstatic.com/firebasejs/10.7.1/firebase-firestore.js";

/* ================= DOM ================= */

const recordTable = document.getElementById("recordTable");
const recordForm = document.getElementById("recordForm");
const searchInput = document.getElementById("searchInput");

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

/* ================= TAB SYSTEM ================= */

window.openTab = (evt, tabId) => {

  document.querySelectorAll(".tab-content")
    .forEach(tab => tab.classList.remove("active"));

  document.querySelectorAll(".tab-btn")
    .forEach(btn => btn.classList.remove("active"));

  document.getElementById(tabId).classList.add("active");
  evt.currentTarget.classList.add("active");
};

/* ================= CONTACTS ================= */

let editContactId = null;

onSnapshot(contactsCol, snap => {

  driverSelect.innerHTML="";
  helperSelect.innerHTML="";
  contactTable.innerHTML="";

  snap.forEach(d=>{
    const c=d.data();

    if(c.type==="driver")
      driverSelect.innerHTML+=`<option value="${d.id}">${c.name}</option>`;

    if(c.type==="helper")
      helperSelect.innerHTML+=`<option value="${d.id}">${c.name}</option>`;

    contactTable.innerHTML+=`
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

window.editContact=(id,name,phone,type)=>{
  editContactId=id;
  contactName.value=name;
  contactPhone.value=phone;
  contactType.value=type;
};

window.saveContact=async()=>{
  const data={
    type:contactType.value,
    name:contactName.value,
    phone:contactPhone.value
  };

  if(editContactId){
    await updateDoc(doc(db,"contacts",editContactId),data);
    editContactId=null;
  }else{
    await addDoc(contactsCol,data);
  }

  contactName.value="";
  contactPhone.value="";
};

window.deleteContact=id=>deleteDoc(doc(db,"contacts",id));

/* ================= LORRIES ================= */

onSnapshot(lorriesCol,snap=>{

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

window.saveLorry=async()=>{
  if(!lorryNumber.value) return;
  await addDoc(lorriesCol,{number:lorryNumber.value});
  lorryNumber.value="";
};

window.deleteLorry=id=>deleteDoc(doc(db,"lorries",id));

/* ================= RECORDS ================= */

let editRecordId=null;
let allRecords=[];

const q=query(recordsCol,orderBy("soNum","desc"));

onSnapshot(q,async snap=>{

  allRecords=[];

  for(const d of snap.docs){

    const r=d.data();

    let driver="-",helper="-",lorry="-";

    if(r.driverId){
      const docSnap=await getDoc(doc(db,"contacts",r.driverId));
      if(docSnap.exists()) driver=docSnap.data().name;
    }else{
      driver=r.driverText||"-";
    }

    if(r.helperId){
      const docSnap=await getDoc(doc(db,"contacts",r.helperId));
      if(docSnap.exists()) helper=docSnap.data().name;
    }else{
      helper=r.helperText||"-";
    }

    if(r.lorryId){
      const docSnap=await getDoc(doc(db,"lorries",r.lorryId));
      if(docSnap.exists()) lorry=docSnap.data().number;
    }else{
      lorry=r.lorryText||"-";
    }

    allRecords.push({
      id:d.id,
      so:r.so,
      soNum:r.soNum||0,
      driver,
      helper,
      lorry,
      start:r.start,
      end:r.end||"-",
      days:r.days
    });
  }

  renderRecords(allRecords);

});

/* ================= SEARCH ================= */

window.searchRecords=()=>{
  const term=searchInput.value.toLowerCase();

  const filtered=allRecords.filter(r=>
    r.so.toLowerCase().includes(term) ||
    r.driver.toLowerCase().includes(term) ||
    r.helper.toLowerCase().includes(term) ||
    r.lorry.toLowerCase().includes(term)
  );

  renderRecords(filtered);
};

/* ================= RENDER ================= */

function renderRecords(data){

  recordTable.innerHTML="";

  data.forEach(r=>{
    recordTable.innerHTML+=`
      <tr>
        <td>${r.so}</td>
        <td>${r.lorry}</td>
        <td>${r.driver}</td>
        <td>${r.helper}</td>
        <td>${r.start}</td>
        <td>${r.end}</td>
        <td>${r.days}</td>
        <td>
          <button onclick="editRec('${r.id}')">✏</button>
          <button onclick="deleteRec('${r.id}')">❌</button>
        </td>
      </tr>`;
  });

}

/* ================= ADD / EDIT ================= */

openFormBtn.onclick=()=>{
  editRecordId=null;
  recordForm.reset();
  recordModal.style.display="flex";
};

window.editRec=async(id)=>{
  const snap=await getDoc(doc(db,"records",id));
  const r=snap.data();

  editRecordId=id;

  soNumber.value=r.soNum;
  startDate.value=r.start;
  endDate.value=r.end||"";

  driverSelect.value=r.driverId||"";
  helperSelect.value=r.helperId||"";
  lorrySelect.value=r.lorryId||"";

  recordModal.style.display="flex";
};

recordForm.onsubmit=async e=>{
  e.preventDefault();

  const soNum=Number(soNumber.value);

  const data={
    so:"SO-"+soNum,
    soNum,
    driverId:driverSelect.value,
    helperId:helperSelect.value,
    lorryId:lorrySelect.value,
    start:startDate.value,
    end:endDate.value||"",
    days:endDate.value
      ? Math.ceil((new Date(endDate.value)-new Date(startDate.value))/86400000)+1
      : "In Progress"
  };

  if(editRecordId){
    await updateDoc(doc(db,"records",editRecordId),data);
  }else{
    await addDoc(recordsCol,data);
  }

  recordModal.style.display="none";
};

window.deleteRec=id=>deleteDoc(doc(db,"records",id));
