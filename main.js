// main.js
// Employee ID Generator Web App
// Organized and commented for clarity and easy understanding

// --- UI Setup ---
document.getElementById('app').innerHTML = `
  <h2>Upload Employee Excel File</h2>
  <button id="downloadTemplateBtn">Download Excel Template</button>
  <input type="file" id="fileInput" accept=".xlsx, .xls" />
  <button id="uploadBtn">Upload</button>
  <div id="uploadStatus"></div>
  <div id="tablePreview"></div>
  <button id="generateIdBtn" style="display:none; margin-top:20px;">Generate ID</button>
  <button id="exportBtn" style="display:none; margin-top:10px;">Export to Excel</button>
`;

// --- Global Variables ---
let lastJson = null;      // Stores the uploaded data
let lastColumns = null;   // Stores the current columns

// --- Load Excel Library ---
const script = document.createElement('script');
script.src = 'https://cdn.jsdelivr.net/npm/xlsx@0.18.5/dist/xlsx.full.min.js';
document.head.appendChild(script);

script.onload = () => {
  // --- Button: Download Excel Template ---
  document.getElementById('downloadTemplateBtn').onclick = downloadTemplate;

  // --- Button: Upload Excel File ---
  document.getElementById('uploadBtn').onclick = handleFileUpload;

  // --- Button: Generate Employee IDs ---
  document.getElementById('generateIdBtn').onclick = generateEmployeeIDs;

  document.getElementById('exportBtn').onclick = exportToExcel;
};

// --- Download a blank Excel template with required columns ---
function downloadTemplate() {
  const headers = [["Employee name", "Old ID number", "Joining date", "Department"]];
  const ws = XLSX.utils.aoa_to_sheet(headers);
  const wb = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(wb, ws, "Employees");
  XLSX.writeFile(wb, "employee_template.xlsx");
}

// --- Handle file upload and validation ---
function handleFileUpload() {
  const fileInput = document.getElementById('fileInput');
  const uploadStatus = document.getElementById('uploadStatus');
  const tablePreview = document.getElementById('tablePreview');
  const generateIdBtn = document.getElementById('generateIdBtn');

  // Check if a file is selected
  if (!fileInput.files.length) {
    showStatus('Please select a file.', true);
    tablePreview.innerHTML = '';
    generateIdBtn.style.display = 'none';
    document.getElementById('exportBtn').style.display = 'none';
    return;
  }

  const file = fileInput.files[0];
  const reader = new FileReader();
  reader.onload = function(e) {
    const data = new Uint8Array(e.target.result);
    const workbook = XLSX.read(data, { type: 'array' });
    const sheetName = workbook.SheetNames[0];
    const worksheet = workbook.Sheets[sheetName];
    let json = XLSX.utils.sheet_to_json(worksheet, { defval: '' });

    // Check for data
    if (!json.length) {
      showStatus('No data found in the file.', true);
      tablePreview.innerHTML = '';
      generateIdBtn.style.display = 'none';
      document.getElementById('exportBtn').style.display = 'none';
      return;
    }

    // Only keep required columns
    const requiredColumns = ['Employee name', 'Old ID number', 'Joining date', 'Department'];
    const fileColumns = Object.keys(json[0]);
    const missing = requiredColumns.filter(col => !fileColumns.includes(col));
    if (missing.length > 0) {
      showStatus(`Missing required column(s): ${missing.join(', ')}`, true);
      tablePreview.innerHTML = '';
      generateIdBtn.style.display = 'none';
      document.getElementById('exportBtn').style.display = 'none';
      return;
    }
    json = json.map(row => {
      const filtered = {};
      requiredColumns.forEach(col => filtered[col] = row[col]);
      return filtered;
    });

    // Store for later use
    lastJson = json;
    lastColumns = [...requiredColumns];

    // Show table
    renderTable(json, lastColumns);
    showStatus('File uploaded and parsed successfully!');
    generateIdBtn.style.display = 'inline-block';
    document.getElementById('exportBtn').style.display = 'none';
  };
  reader.onerror = function() {
    showStatus('Error reading file.', true);
    tablePreview.innerHTML = '';
    generateIdBtn.style.display = 'none';
    document.getElementById('exportBtn').style.display = 'none';
  };
  reader.readAsArrayBuffer(file);
}

// --- Generate Employee IDs and add as a new column ---
function generateEmployeeIDs() {
  if (!lastJson || !lastColumns) return;
  // Add new column if not already present
  if (!lastColumns.includes('Employee ID')) {
    lastColumns.push('Employee ID');
  }
  lastJson.forEach(row => {
    const dept = row['Department'] || '';
    let dateVal = row['Joining date'];
    if (typeof dateVal === 'number') dateVal = formatDateString(dateVal);
    let year = '', month = '', day = '';
    if (dateVal) {
      const d = new Date(dateVal);
      if (!isNaN(d)) {
        year = d.getFullYear();
        month = String(d.getMonth() + 1).padStart(2, '0');
        day = String(d.getDate()).padStart(2, '0');
      } else {
        const parts = dateVal.split(/[-\/]/);
        if (parts.length >= 3) {
          year = parts[0];
          month = parts[1].padStart(2, '0');
          day = parts[2].padStart(2, '0');
        }
      }
    }
    row['Employee ID'] = `${dept}-${year}-${month}${day}`;
  });
  renderTable(lastJson, lastColumns);
  document.getElementById('exportBtn').style.display = 'inline-block';
}

// --- Render the data table ---
function renderTable(json, columns) {
  const tablePreview = document.getElementById('tablePreview');
  let table = '<table border="1" cellpadding="5"><thead><tr>';
  columns.forEach(key => {
    table += `<th>${key}</th>`;
  });
  table += '</tr></thead><tbody>';
  json.forEach(row => {
    table += '<tr>';
    columns.forEach(key => {
      let val = row[key] || '';
      if (key === 'Joining date') {
        val = formatDateString(val);
      }
      table += `<td>${val}</td>`;
    });
    table += '</tr>';
  });
  table += '</tbody></table>';
  tablePreview.innerHTML = table;
}

// --- Utility: Show status messages ---
function showStatus(message, isError = false) {
  const uploadStatus = document.getElementById('uploadStatus');
  uploadStatus.textContent = message;
  uploadStatus.style.color = isError ? '#ff2d42' : '#fff';
}

// --- Utility: Convert Excel serial date to YYYY-MM-DD ---
function excelDateToJSDate(serial) {
  const utc_days = Math.floor(serial - 25569);
  const utc_value = utc_days * 86400;
  const date_info = new Date(utc_value * 1000);
  const fractional_day = serial - Math.floor(serial) + 0.0000001;
  let total_seconds = Math.floor(86400 * fractional_day);
  const seconds = total_seconds % 60;
  total_seconds -= seconds;
  const hours = Math.floor(total_seconds / (60 * 60));
  const minutes = Math.floor(total_seconds / 60) % 60;
  return new Date(date_info.getFullYear(), date_info.getMonth(), date_info.getDate(), hours, minutes, seconds);
}
function formatDateString(val) {
  if (typeof val === 'number') {
    const d = excelDateToJSDate(val);
    return d.toISOString().slice(0, 10); // YYYY-MM-DD
  }
  return val;
}

// --- Export the table to Excel ---
function exportToExcel() {
  if (!lastJson || !lastColumns) return;
  // Create a worksheet from the data
  const ws = XLSX.utils.json_to_sheet(lastJson, { header: lastColumns });
  // Create a new workbook and append the worksheet
  const wb = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(wb, ws, "Employees");
  // Download the file
  XLSX.writeFile(wb, "employee_ids.xlsx");
} 