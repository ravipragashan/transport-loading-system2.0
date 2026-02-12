import { db } from "./firebase.js";
import {
  collection,
  addDoc,
  deleteDoc,
  doc,
  updateDoc,
  onSnapshot,
  getDoc,
  query,
  orderBy
} from "https://www.gstatic.com/firebasejs/10.7.1/firebase-firestore.js";

const recordsCol = collection(db,"records");
const contactsCol = collection(db,"contacts");
const lorriesCol = collection(db,"lorries");

let editRecordId=null;

/* REALTIME CONTACTS */
onSnapshot(contactsCol,snap=>{
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
        <td>${c.phone||""}</td>
        <td>
          <button onclick="deleteContact('${d.id}')">❌</button>
        </td>
      </tr>`;
  });
});

/* REALTIME LORRIES */
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

/* REALTIME RECORDS SORTED DESC */
const q=query(recordsCol,orderBy("so","desc"));

onSnapshot(q,snap=>{
  recordTable.innerHTML="";
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
});

/* SAVE RECORD */
recordForm.onsubmit=async e=>{
  e.preventDefault();

  const start=startDate.value;
  const end=endDate.value;

  const rec={
    so:Number(soNumber.value),
    lorryId:lorrySelect.value,
    driverId:driverSelect.value,
    helperId:helperSelect.value,
    lorryText:lorrySelect.options[lorrySelect.selectedIndex].text,
    driverText:driverSelect.options[driverSelect.selectedIndex].text,
    helperText:helperSelect.options[helperSelect.selectedIndex].text,
    start,
    end:end||"",
    days:end
      ? Math.ceil((new Date(end)-new Date(start))/86400000)+1
      : "In Progress"
  };

  if(editRecordId)
    await updateDoc(doc(db,"records",editRecordId),rec);
  else
    await addDoc(recordsCol,rec);

  editRecordId=null;
  closeRecord();
};

/* DELETE */
window.deleteRec=id=>deleteDoc(doc(db,"records",id));
window.deleteContact=id=>deleteDoc(doc(db,"contacts",id));
window.deleteLorry=id=>deleteDoc(doc(db,"lorries",id));

/* SAVE CONTACT */
window.saveContact=async()=>{
  const data={
    type:contactType.value,
    name:contactName.value,
    phone:contactPhone.value
  };
  await addDoc(contactsCol,data);
};

/* SAVE LORRY */
window.saveLorry=async()=>{
  const data={number:lorryNumber.value};
  await addDoc(lorriesCol,data);
};

/* EDIT */
window.editRec=async id=>{
  const snap=await getDoc(doc(db,"records",id));
  const r=snap.data();
  soNumber.value=r.so;
  lorrySelect.value=r.lorryId;
  driverSelect.value=r.driverId;
  helperSelect.value=r.helperId;
  startDate.value=r.start;
  endDate.value=r.end;
  editRecordId=id;
  recordModal.style.display="block";
};

/* WHATSAPP */
window.shareWA=async id=>{
  const snap=await getDoc(doc(db,"records",id));
  const r=snap.data();
  const msg=`Loading Details
SO - ${r.so}
Lorry - ${r.lorryText}
Driver - ${r.driverText}
Helper - ${r.helperText}
Start - ${r.start}
End - ${r.end||"In Progress"}`;
  window.open("https://wa.me/?text="+encodeURIComponent(msg));
};

/* MODAL */
window.openFormBtn.onclick=()=>recordModal.style.display="block";
window.closeRecord=()=>recordModal.style.display="none";
window.manageContactsBtn.onclick=()=>contactModal.style.display="block";
window.manageLorriesBtn.onclick=()=>lorryModal.style.display="block";
window.closeContacts=()=>contactModal.style.display="none";
window.closeLorries=()=>lorryModal.style.display="none";
