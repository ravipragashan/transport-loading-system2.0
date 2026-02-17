import { db } from "./firebase.js";
import {
  collection, addDoc, deleteDoc,
  doc, getDoc, updateDoc,
  onSnapshot
} from "https://www.gstatic.com/firebasejs/10.7.1/firebase-firestore.js";

/* COLLECTIONS */
const recordsCol = collection(db,"records");
const contactsCol = collection(db,"contacts");
const lorriesCol = collection(db,"lorries");

/* DOM */
const recordTable = document.getElementById("recordTable");
const contactTable = document.getElementById("contactTable");
const lorryTable = document.getElementById("lorryTable");
const searchInput = document.getElementById("searchInput");

const openFormBtn = document.getElementById("openFormBtn");
const recordModal = document.getElementById("recordModal");
const cancelRecordBtn = document.getElementById("cancelRecordBtn");
const recordForm = document.getElementById("recordForm");

const soNumber = document.getElementById("soNumber");
const startDate = document.getElementById("startDate");
const endDate = document.getElementById("endDate");

const driverSelect = document.getElementById("driverSelect");
const helperSelect = document.getElementById("helperSelect");
const lorrySelect = document.getElementById("lorrySelect");

const contactType = document.getElementById("contactType");
const contactName = document.getElementById("contactName");
const contactPhone = document.getElementById("contactPhone");
const saveContactBtn = document.getElementById("saveContactBtn");

const lorryNumber = document.getElementById("lorryNumber");
const saveLorryBtn = document.getElementById("saveLorryBtn");

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

saveContactBtn.onclick=async()=>{
  await addDoc(contactsCol,{
    type:contactType.value,
    name:contactName.value,
    phone:contactPhone.value
  });
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

saveLorryBtn.onclick=async()=>{
  await addDoc(lorriesCol,{number:lorryNumber.value});
};

window.deleteLorry=id=>deleteDoc(doc(db,"lorries",id));

/* RECORDS */
let allRecords=[];
let editRecordId=null;

onSnapshot(recordsCol, async snap=>{
  allRecords=[];

  for(const d of snap.docs){

    const r=d.data();

    let driver="-",helper="-",lorry="-";

    if(r.driverId){
      const s=await getDoc(doc(db,"contacts",r.driverId));
      if(s.exists()) driver=s.data().name;
    }

    if(r.helperId){
      const s=await getDoc(doc(db,"contacts",r.helperId));
      if(s.exists()) helper=s.data().name;
    }

    if(r.lorryId){
      const s=await getDoc(doc(db,"lorries",r.lorryId));
      if(s.exists()) lorry=s.data().number;
    }

    allRecords.push({
      id:d.id,
      so:r.so,
      soNumber: Number(r.so.replace("SO-","")),
      driver,helper,lorry,
      start:r.start,
      end:r.end||"-",
      days:r.days
    });
  }

  // SORT BIG SO FIRST
  allRecords.sort((a,b)=>b.soNumber-a.soNumber);

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
        <td>
          <button onclick="editRec('${r.id}')">✏</button>
          <button onclick="shareWA('${r.id}')">🟢</button>
          <button onclick="deleteRec('${r.id}')">❌</button>
        </td>
      </tr>`;
  });
}

/* SEARCH */
searchInput.addEventListener("input",()=>{
  const term=searchInput.value.toLowerCase();
  render(allRecords.filter(r=>
    r.so.toLowerCase().includes(term)||
    r.driver.toLowerCase().includes(term)||
    r.helper.toLowerCase().includes(term)||
    r.lorry.toLowerCase().includes(term)
  ));
});

/* ADD / EDIT RECORD */
openFormBtn.onclick=()=>{
  editRecordId=null;
  recordForm.reset();
  recordModal.style.display="flex";
};

cancelRecordBtn.onclick=()=>recordModal.style.display="none";

window.editRec=async(id)=>{
  const snap=await getDoc(doc(db,"records",id));
  const r=snap.data();
  editRecordId=id;
  soNumber.value=r.so.replace("SO-","");
  startDate.value=r.start;
  endDate.value=r.end||"";
  driverSelect.value=r.driverId;
  helperSelect.value=r.helperId;
  lorrySelect.value=r.lorryId;
  recordModal.style.display="flex";
};

recordForm.onsubmit=async e=>{
  e.preventDefault();

  const data={
    so:"SO-"+soNumber.value,
    driverId:driverSelect.value,
    helperId:helperSelect.value,
    lorryId:lorrySelect.value,
    start:startDate.value,
    end:endDate.value||"",
    days:endDate.value?
      Math.ceil((new Date(endDate.value)-new Date(startDate.value))/86400000)+1
      :"In Progress"
  };

  if(editRecordId){
    await updateDoc(doc(db,"records",editRecordId),data);
  }else{
    await addDoc(recordsCol,data);
  }

  recordModal.style.display="none";
};

window.deleteRec=id=>deleteDoc(doc(db,"records",id));

/* WHATSAPP */
window.shareWA=async(id)=>{
  const snap=await getDoc(doc(db,"records",id));
  const r=snap.data();

  const driver=(await getDoc(doc(db,"contacts",r.driverId))).data();
  const helper=(await getDoc(doc(db,"contacts",r.helperId))).data();
  const lorry=(await getDoc(doc(db,"lorries",r.lorryId))).data();

  const dateObj=new Date(r.start);
  const date=`${dateObj.getDate()}-${dateObj.getMonth()+1}-${dateObj.getFullYear()}`;

  const msg=
`${date} Loaded
Order Number - ${r.so}
Lorry Number: ${lorry.number}
Driver :- ${driver.name} - ${driver.phone}
Poter :- ${helper.name} - ${helper.phone}`;

  window.open("https://wa.me/?text="+encodeURIComponent(msg));
};
