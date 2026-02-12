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

let editRecordId=null;

/* =========================
   REALTIME RECORDS
========================= */
const q=query(recordsCol,orderBy("soNum","desc"));

onSnapshot(q,snap=>{
  recordTable.innerHTML="";
  snap.forEach(d=>{
    const r=d.data();

    const lorry = r.lorry || r.lorryText || "-";
    const driver = r.driver || r.driverText || "-";
    const helper = r.helper || r.helperText || "-";

    recordTable.innerHTML+=`
      <tr>
        <td>${r.so}</td>
        <td>${lorry}</td>
        <td>${driver}</td>
        <td>${helper}</td>
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

/* =========================
   SAVE RECORD
========================= */
recordForm.onsubmit=async e=>{
  e.preventDefault();

  const soNum=Number(soNumber.value);

  const rec={
    so:"SO-"+soNum,
    soNum:soNum,
    lorry:lorrySelect.options[lorrySelect.selectedIndex].text,
    driver:driverSelect.options[driverSelect.selectedIndex].text,
    helper:helperSelect.options[helperSelect.selectedIndex].text,
    start:startDate.value,
    end:endDate.value||"",
    days:endDate.value
      ? Math.ceil((new Date(endDate.value)-new Date(startDate.value))/86400000)+1
      : "In Progress"
  };

  if(editRecordId)
    await updateDoc(doc(db,"records",editRecordId),rec);
  else
    await addDoc(recordsCol,rec);

  editRecordId=null;
  closeRecord();
};

/* =========================
   WHATSAPP SHARE
========================= */
window.shareWA=async id=>{
  const recordSnap=await getDoc(doc(db,"records",id));
  const r=recordSnap.data();

  const lorry = r.lorry || r.lorryText || "-";
  const driverName = r.driver || r.driverText || "-";
  const helperName = r.helper || r.helperText || "-";

  let driverPhone="";
  let helperPhone="";

  const contactsSnap=await getDocs(contactsCol);

  contactsSnap.forEach(d=>{
    const c=d.data();
    if(c.name===driverName) driverPhone=c.phone;
    if(c.name===helperName) helperPhone=c.phone;
  });

  const dateObj=new Date(r.start);
  const formattedDate=
    dateObj.getDate()+"-"+(dateObj.getMonth()+1)+"-"+dateObj.getFullYear();

  const message=
`${formattedDate} Loaded
Order Number - ${r.so}
Lorry Number: ${lorry}
Driver :- ${driverName} - ${driverPhone}
Poter :- ${helperName} - ${helperPhone}`;

  window.open("https://wa.me/?text="+encodeURIComponent(message));
};

/* DELETE */
window.deleteRec=id=>deleteDoc(doc(db,"records",id));

/* EDIT */
window.editRec=async id=>{
  const snap=await getDoc(doc(db,"records",id));
  const r=snap.data();
  soNumber.value=r.soNum;
  startDate.value=r.start;
  endDate.value=r.end;
  editRecordId=id;
  recordModal.style.display="block";
};

/* MODAL */
window.openFormBtn.onclick=()=>recordModal.style.display="block";
window.closeRecord=()=>recordModal.style.display="none";
