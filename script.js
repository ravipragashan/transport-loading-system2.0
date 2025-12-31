import { db } from "./firebase.js";
import {
  collection, addDoc, getDocs, deleteDoc, doc, updateDoc
} from "https://www.gstatic.com/firebasejs/10.7.1/firebase-firestore.js";

const PROVINCES = [
  "Western","Central","Southern","Northern","Eastern",
  "North Western","North Central","Uva","Sabaragamuwa"
];

const recordsCol = collection(db,"records");
const contactsCol = collection(db,"contacts");
const lorriesCol = collection(db,"lorries");

let editRecordId=null, editContactId=null, editLorryId=null;
let tempDocs=[];

/* ---------- INIT ---------- */
PROVINCES.forEach(p=>{
  contactProvince.innerHTML+=`<option>${p}</option>`;
  lorryProvince.innerHTML+=`<option>${p}</option>`;
});

loadContacts(); loadLorries(); loadRecords();

/* ---------- CONTACTS ---------- */
async function loadContacts(){
  driverSelect.innerHTML="";
  helperSelect.innerHTML="";
  contactTable.innerHTML="";

  const snap=await getDocs(contactsCol);
  snap.forEach(d=>{
    const c=d.data();
    const opt=`<option value="${d.id}">${c.name} (${c.phone}) - ${c.province}</option>`;
    if(c.type==="driver") driverSelect.innerHTML+=opt;
    if(c.type==="helper") helperSelect.innerHTML+=opt;

    contactTable.innerHTML+=`
      <tr>
        <td>${c.name}</td>
        <td>${c.phone}</td>
        <td>${c.province}</td>
        <td>
          <button onclick="editContact('${d.id}','${c.name}','${c.phone}','${c.province}','${c.type}')">✏</button>
          <button onclick="deleteContact('${d.id}')">❌</button>
        </td>
      </tr>`;
  });
}

window.saveContact=async()=>{
  const data={
    type:contactType.value,
    name:contactName.value,
    phone:contactPhone.value,
    province:contactProvince.value
  };
  editContactId
    ? await updateDoc(doc(db,"contacts",editContactId),data)
    : await addDoc(contactsCol,data);
  editContactId=null;
  loadContacts();
};

window.editContact=(id,n,p,pr,t)=>{
  editContactId=id;
  contactName.value=n;
  contactPhone.value=p;
  contactProvince.value=pr;
  contactType.value=t;
};

window.deleteContact=id=>deleteDoc(doc(db,"contacts",id)).then(loadContacts);

/* ---------- LORRIES ---------- */
async function loadLorries(){
  lorrySelect.innerHTML="";
  lorryTable.innerHTML="";
  const snap=await getDocs(lorriesCol);
  snap.forEach(d=>{
    const l=d.data();
    lorrySelect.innerHTML+=`<option value="${d.id}">${l.number} - ${l.province}</option>`;
    lorryTable.innerHTML+=`
      <tr>
        <td>${l.number}</td>
        <td>${l.province}</td>
        <td>
          <button onclick="editLorry('${d.id}','${l.number}','${l.province}')">✏</button>
          <button onclick="deleteLorry('${d.id}')">❌</button>
        </td>
      </tr>`;
  });
}

window.saveLorry=async()=>{
  const data={number:lorryNumber.value,province:lorryProvince.value};
  editLorryId
    ? await updateDoc(doc(db,"lorries",editLorryId),data)
    : await addDoc(lorriesCol,data);
  editLorryId=null;
  loadLorries();
};

window.editLorry=(id,n,p)=>{
  editLorryId=id;
  lorryNumber.value=n;
  lorryProvince.value=p;
};

window.deleteLorry=id=>deleteDoc(doc(db,"lorries",id)).then(loadLorries);

/* ---------- RECORDS ---------- */
async function loadRecords(){
  recordTable.innerHTML="";
  const snap=await getDocs(recordsCol);
  snap.forEach(d=>{
    const r=d.data();
    recordTable.innerHTML+=`
      <tr>
        <td>${r.so}</td>
        <td>${r.lorryText}</td>
        <td>${r.driverText}</td>
        <td>${r.helperText}</td>
        <td>${r.start}</td>
        <td>${r.end||"-"}</td>
        <td>${r.days}</td>
        <td>
          <button onclick="editRec('${d.id}')">✏</button>
          <button onclick="shareWA('${d.id}')">🟢</button>
          <button onclick="deleteRec('${d.id}')">❌</button>
        </td>
      </tr>`;
  });
}

recordForm.onsubmit=async e=>{
  e.preventDefault();
  const rec={
    so:soNumber.value,
    lorryId:lorrySelect.value,
    driverId:driverSelect.value,
    helperId:helperSelect.value,
    lorryText:lorrySelect.options[lorrySelect.selectedIndex].text,
    driverText:driverSelect.options[driverSelect.selectedIndex].text,
    helperText:helperSelect.options[helperSelect.selectedIndex].text,
    start:startDate.value,
    end:endDate.value||"",
    days:endDate.value?Math.ceil((new Date(endDate.value)-new Date(startDate.value))/86400000)+1:"In Progress"
  };
  editRecordId
    ? await updateDoc(doc(db,"records",editRecordId),rec)
    : await addDoc(recordsCol,rec);
  closeRecord(); loadRecords();
};

window.deleteRec=id=>deleteDoc(doc(db,"records",id)).then(loadRecords);

/* ---------- UI ---------- */
window.openFormBtn.onclick=()=>recordModal.style.display="block";
window.manageContactsBtn.onclick=()=>contactModal.style.display="block";
window.manageLorriesBtn.onclick=()=>lorryModal.style.display="block";

window.closeRecord=()=>recordModal.style.display="none";
window.closeContacts=()=>contactModal.style.display="none";
window.closeLorries=()=>lorryModal.style.display="none";

/* ---------- WHATSAPP ---------- */
window.shareWA=async id=>{
  const snap=await getDocs(recordsCol);
  snap.forEach(d=>{
    if(d.id===id){
      const r=d.data();
      const msg=`"${r.start}" Loaded
Order Number - ${r.so}
Lorry - ${r.lorryText}
Driver - ${r.driverText}
Helper - ${r.helperText}`;
      window.open("https://wa.me/?text="+encodeURIComponent(msg));
    }
  });
};
