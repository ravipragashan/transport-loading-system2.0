body {
  font-family: Arial, sans-serif;
  margin: 0;
  background: #f4f6f9;
  padding: 20px;
}

/* ================= HEADER ================= */

header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  flex-wrap: wrap;
  margin-bottom: 20px;
}

.header-buttons {
  display: flex;
  gap: 8px;
  flex-wrap: wrap;
}

button {
  padding: 8px 14px;
  background: #007a2f;
  color: white;
  border: none;
  border-radius: 6px;
  cursor: pointer;
  font-size: 14px;
}

button:hover {
  opacity: 0.9;
}

/* ================= TABLE ================= */

.table-wrapper {
  overflow-x: auto;
  background: white;
  border-radius: 8px;
  box-shadow: 0 3px 10px rgba(0,0,0,0.08);
}

table {
  width: 100%;
  border-collapse: collapse;
  min-width: 800px;
}

th, td {
  padding: 10px;
  border-bottom: 1px solid #eee;
  text-align: left;
  font-size: 14px;
}

th {
  background: #007a2f;
  color: white;
  font-weight: 600;
}

tr:hover {
  background: #fafafa;
}

/* ================= MODAL ================= */

.modal {
  display: none;
  position: fixed;
  inset: 0;
  background: rgba(0,0,0,.5);
  justify-content: center;
  align-items: center;
  padding: 20px;
  z-index: 1000;
}

.modal-box {
  background: white;
  width: 500px;
  max-height: 90vh;
  overflow-y: auto;
  border-radius: 10px;
  padding: 25px;
  box-shadow: 0 10px 30px rgba(0,0,0,0.2);
  animation: fadeIn 0.2s ease;
}

.modal-box h3 {
  margin-top: 0;
  margin-bottom: 15px;
}

input, select {
  width: 100%;
  padding: 9px;
  margin-bottom: 12px;
  border-radius: 6px;
  border: 1px solid #ccc;
  font-size: 14px;
}

.modal-buttons {
  display: flex;
  justify-content: space-between;
  margin-top: 10px;
}

/* ================= MOBILE VERSION ================= */

@media (max-width: 768px) {

  body {
    padding: 10px;
  }

  table {
    min-width: 900px;
  }

  /* Modal becomes full screen on mobile */
  .modal {
    align-items: flex-end;
    padding: 0;
  }

  .modal-box {
    width: 100%;
    height: 95vh;
    border-radius: 20px 20px 0 0;
    padding: 20px;
  }

  .modal-buttons {
    flex-direction: column;
    gap: 10px;
  }

  .modal-buttons button {
    width: 100%;
  }

}
