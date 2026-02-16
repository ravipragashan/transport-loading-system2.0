/* ================= BASE ================= */

body {
  font-family: Arial, sans-serif;
  margin: 0;
  background: #f4f6f9;
  padding: 30px;
}

/* ================= HEADER ================= */

header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 25px;
}

header h2 {
  margin: 0;
  font-size: 22px;
  font-weight: 600;
}

.header-buttons {
  display: flex;
  gap: 10px;
}

button {
  padding: 8px 16px;
  background: #007a2f;
  color: white;
  border: none;
  border-radius: 6px;
  cursor: pointer;
  font-size: 14px;
  font-weight: 500;
}

button:hover {
  background: #006226;
}

/* ================= TABLE ================= */

.table-wrapper {
  background: white;
  border-radius: 10px;
  box-shadow: 0 5px 20px rgba(0,0,0,0.08);
  overflow: hidden;
}

table {
  width: 100%;
  border-collapse: collapse;
}

th {
  background: #007a2f;
  color: white;
  text-align: left;
  padding: 12px 15px;
  font-size: 14px;
}

td {
  padding: 12px 15px;
  border-bottom: 1px solid #eee;
  font-size: 14px;
}

tr:last-child td {
  border-bottom: none;
}

tr:hover {
  background: #fafafa;
}

/* Action buttons inside table */
td button {
  padding: 5px 10px;
  font-size: 12px;
  margin-right: 5px;
  border-radius: 4px;
}

/* ================= MODAL ================= */

.modal {
  display: none;
  position: fixed;
  inset: 0;
  background: rgba(0,0,0,.45);
  justify-content: center;
  align-items: center;
  z-index: 1000;
}

.modal-box {
  background: white;
  width: 550px;
  max-height: 85vh;
  overflow-y: auto;
  border-radius: 12px;
  padding: 30px;
  box-shadow: 0 15px 40px rgba(0,0,0,0.2);
}

.modal-box h3 {
  margin-top: 0;
  margin-bottom: 20px;
  font-size: 18px;
}

input, select {
  width: 100%;
  padding: 10px;
  margin-bottom: 15px;
  border-radius: 6px;
  border: 1px solid #ccc;
  font-size: 14px;
}

.modal-buttons {
  display: flex;
  justify-content: flex-end;
  gap: 10px;
}

/* ================= RESPONSIVE ================= */

@media (max-width: 1024px) {
  body {
    padding: 20px;
  }

  .modal-box {
    width: 90%;
  }
}

@media (max-width: 768px) {

  body {
    padding: 10px;
  }

  header {
    flex-direction: column;
    align-items: flex-start;
    gap: 10px;
  }

  .header-buttons {
    flex-wrap: wrap;
  }

  .modal-box {
    width: 100%;
    height: 95vh;
    border-radius: 20px 20px 0 0;
  }

}
