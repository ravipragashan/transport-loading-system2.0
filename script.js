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

const prevPageBtn = document.getElementById("prevPage");
const nextPageBtn = document.getElementById("nextPage");
const pageInfo = document.getElementById("pageInfo");

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
  });
});

/* RECORDS */
let allRecords=[];
let currentPage=1;
const rowsPerPage=10;
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
      soNumber:Number(r.so.replace("SO-","")),
      driver,helper,lorry,
      start:r.start,
      end:r.end||"-",
      days:r.days
    });
  }

  allRecords.sort((a,b)=>b.soNumber-a.soNumber);
  currentPage=1;
  render(allRecords);
});

function render(data){
  recordTable.innerHTML="";
  const totalPages=Math.ceil(data.length/rowsPerPage)||1;
  const start=(currentPage-1)*rowsPerPage;
  const pageData=data.slice(start,start+rowsPerPage);

  pageData.forEach(r=>{
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

  pageInfo.innerText=`Page ${currentPage} of ${totalPages}`;
  prevPageBtn.disabled=currentPage===1;
  nextPageBtn.disabled=currentPage===totalPages;
}

/* PAGINATION */
prevPageBtn.onclick=()=>{ if(currentPage>1){currentPage--;render(allRecords);} };
nextPageBtn.onclick=()=>{ 
  const totalPages=Math.ceil(allRecords.length/rowsPerPage);
  if(currentPage<totalPages){currentPage++;render(allRecords);}
};

/* SEARCH */
searchInput.addEventListener("input",()=>{
  const term=searchInput.value.toLowerCase();
  const filtered=allRecords.filter(r=>
    r.so.toLowerCase().includes(term)||
    r.driver.toLowerCase().includes(term)||
    r.helper.toLowerCase().includes(term)||
    r.lorry.toLowerCase().includes(term)
  );
  currentPage=1;
  render(filtered);
});
