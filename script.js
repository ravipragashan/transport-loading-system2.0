import { db } from "./firebase.js";
import {
  collection,
  addDoc,
  deleteDoc,
  doc,
  getDoc,
  onSnapshot,
  query,
  orderBy
} from "https://www.gstatic.com/firebasejs/10.7.1/firebase-firestore.js";

/* DOM */
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
const contactModal = document.getElementById("contactModal");
const lorryModal = document.getElementById("lorryModal");

const openFormBtn = document.getElementById("openFormBtn");
const manageContactsBtn = document.getElementById("manageContactsBtn");
const manageLorriesBtn = document.getElementById("manageLorriesBtn");

/* Collections */
const recordsCol = collection(db,"records");
const contactsCol = collection(db,"contacts");
const lorriesCol = collection(db,"lorries");

/* Load Contacts */
onSnapshot(contactsCol, snap=>{
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
        <td><button onclick="deleteContact('${d.id}')">❌</button></td>
      </tr>`;
  });
});

/* Load Lorries */
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

/* Load Records */
const q=query(recordsCol,orderBy("soNum","desc"));

onSnapshot(q, async snap=>{
  recordTable.innerHTML="";

  for(const d of snap.docs){
    const r=d.data();

    const driver=(await getDoc(doc(db,"contacts",r.driverId))).data();
    const helper=(await getDoc(doc(db,"contacts",r.helperId))).data();
    const lorry=(await getDoc(doc(db,"lorries",r.lorryId))).data();

    recordTable.innerHTML+=`
      <tr>
        <td>${r.so}</td>
        <td>${lorry?.number||"-"}</td>
        <td>${driver?.name||"-"}</td>
        <td>${helper?.name||"-"}</td>
        <td>${r.start}</td>
        <td>${r.end||"-"}</td>
        <td>${r.days}</td>
        <td>
          <button onclick="shareWA('${d.id}')">🟢</button>
          <button onclick="deleteRec('${d.id}')">❌</button>
        </td>
      </tr>`;
  }
});

/* Save Record */
recordForm.onsubmit=async e=>{
  e.preventDefault();

  const soNum=Number(soNumber.value);

  await addDoc(recordsCol,{
    so:"SO-"+soNum,
    soNum,
    lorryId:lorrySelect.value,
    driverId:driverSelect.value,
    helperId:helperSelect.value,
    start:startDate.value,
    end:endDate.value||"",
    days:endDate.value
      ? Math.ceil((new Date(endDate.value)-new Date(startDate.value))/86400000)+1
      : "In Progress"
  });

  closeRecord();
};

/* Save Contact */
window.saveContact=async()=>{
  await addDoc(contactsCol,{
    type:contactType.value,
    name:contactName.value,
    phone:contactPhone.value
  });
};

/* Save Lorry */
window.saveLorry=async()=>{
  await addDoc(lorriesCol,{
    number:lorryNumber.value
  });
};

/* Delete */
window.deleteRec=id=>deleteDoc(doc(db,"records",id));
window.deleteContact=id=>deleteDoc(doc(db,"contacts",id));
window.deleteLorry=id=>deleteDoc(doc(db,"lorries",id));

/* WhatsApp */
window.shareWA=async id=>{
  const r=(await getDoc(doc(db,"records",id))).data();
  const driver=(await getDoc(doc(db,"contacts",r.driverId))).data();
  const helper=(await getDoc(doc(db,"contacts",r.helperId))).data();
  const lorry=(await getDoc(doc(db,"lorries",r.lorryId))).data();

  const d=new Date(r.start);
  const date=`${d.getDate()}-${d.getMonth()+1}-${d.getFullYear()}`;

  const msg=
`${date} Loaded
Order Number - ${r.so}
Lorry Number: ${lorry.number}
Driver :- ${driver.name} - ${driver.phone}
Poter :- ${helper.name} - ${helper.phone}`;

  window.open("https://wa.me/?text="+encodeURIComponent(msg));
};

/* Modals */
openFormBtn.onclick=()=>recordModal.style.display="block";
manageContactsBtn.onclick=()=>contactModal.style.display="block";
manageLorriesBtn.onclick=()=>lorryModal.style.display="block";

window.closeRecord=()=>recordModal.style.display="none";
window.closeContacts=()=>contactModal.style.display="none";
window.closeLorries=()=>lorryModal.style.display="none";
