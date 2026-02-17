import { db } from "./firebase.js";
import {
  collection, addDoc, deleteDoc,
  doc, getDoc, updateDoc,
  onSnapshot, query, orderBy
} from "https://www.gstatic.com/firebasejs/10.7.1/firebase-firestore.js";

const recordsCol = collection(db,"records");
const contactsCol = collection(db,"contacts");
const lorriesCol = collection(db,"lorries");

const recordTable = document.getElementById("recordTable");
const searchInput = document.getElementById("searchInput");

const driverSelect = document.getElementById("driverSelect");
const helperSelect = document.getElementById("helperSelect");
const lorrySelect = document.getElementById("lorrySelect");

const contactTable = document.getElementById("contactTable");
const lorryTable = document.getElementById("lorryTable");

let allRecords=[];

/* TAB */
window.openTab=(tabId,btn)=>{
  document.querySelectorAll(".tab-content").forEach(t=>t.classList.remove("active"));
  document.querySelectorAll(".tab-btn").forEach(b=>b.classList.remove("active"));
  document.getElementById(tabId).classList.add("active");
  btn.classList.add("active");
};

/* CONTACTS */
onSnapshot(contactsCol,snap=>{
  contactTable.innerHTML="";
  driverSelect.innerHTML="";
  helperSelect.innerHTML="";

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
        <td><button onclick="deleteContact('${d.id}')">❌</button></td>
      </tr>`;
  });
});

window.saveContact=async()=>{
  const data={
    type:contactType.value,
    name:contactName.value,
    phone:contactPhone.value
  };
  await addDoc(contactsCol,data);
};

window.deleteContact=id=>deleteDoc(doc(db,"contacts",id));

/* LORRIES */
onSnapshot(lorriesCol,snap=>{
  lorryTable.innerHTML="";
  lorrySelect.innerHTML="";

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
  await addDoc(lorriesCol,{number:lorryNumber.value});
};

window.deleteLorry=id=>deleteDoc(doc(db,"lorries",id));

/* RECORDS SORTED */
const q=query(recordsCol,orderBy("soNum","desc"));

onSnapshot(q,async snap=>{
  allRecords=[];

  for(const d of snap.docs){
    const r=d.data();

    let driver=r.driverText||"-";
    let helper=r.helperText||"-";
    let lorry=r.lorryText||"-";

    if(r.driverId){
      const docSnap=await getDoc(doc(db,"contacts",r.driverId));
      if(docSnap.exists()) driver=docSnap.data().name;
    }

    if(r.helperId){
      const docSnap=await getDoc(doc(db,"contacts",r.helperId));
      if(docSnap.exists()) helper=docSnap.data().name;
    }

    if(r.lorryId){
      const docSnap=await getDoc(doc(db,"lorries",r.lorryId));
      if(docSnap.exists()) lorry=docSnap.data().number;
    }

    allRecords.push({
      id:d.id,
      so:r.so,
      driver,
      helper,
      lorry,
      start:r.start,
      end:r.end||"-",
      days:r.days
    });
  }

  render(allRecords);
});

function render(data){
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
        <td><button onclick="deleteRec('${r.id}')">❌</button></td>
      </tr>`;
  });
}

/* SEARCH */
searchInput.addEventListener("input",()=>{
  const term=searchInput.value.toLowerCase();
  const filtered=allRecords.filter(r=>
    r.so.toLowerCase().includes(term)||
    r.driver.toLowerCase().includes(term)||
    r.helper.toLowerCase().includes(term)||
    r.lorry.toLowerCase().includes(term)
  );
  render(filtered);
});

window.deleteRec=id=>deleteDoc(doc(db,"records",id));
