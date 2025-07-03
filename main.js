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
  <!-- Pattern selection dropdown -->
  <label for="patternSelect" style="display:none; margin-top:20px; color:#fff; font-weight:500;">Choose ID Pattern:</label>
  <select id="patternSelect" style="display:none; margin-bottom:16px;">
    <option value="pattern1">[Department] - [Year] - [Month][Day]</option>
    <option value="pattern2">[Year][Month][Day] - [Department]</option>
    <option value="pattern3">[Department]-[Old ID number]-[Year]</option>
    <option value="pattern4">[Year]-[Department]-[Employee name initials]</option>
    <option value="pattern5">[Department]-[Year]-[Serial Number]</option>
  </select>
  <button id="generateIdBtn" style="display:none; margin-top:10px;">Generate ID</button>
  <button id="exportBtn" style="display:none; margin-top:10px;">Export to Excel</button>
`;

// --- Add Department Mapping Upload UI ---
const appDiv = document.getElementById('app');
const deptMapSection = document.createElement('div');
deptMapSection.innerHTML = `
  <h2>Upload Department Mapping Excel File</h2>
  <input type="file" id="deptMapFileInput" accept=".xlsx, .xls" />
  <button id="deptMapUploadBtn">Upload Department Mapping</button>
  <div id="deptMapStatus"></div>
`;
appDiv.insertBefore(deptMapSection, appDiv.firstChild.nextSibling); // After the main title

// --- Global Variables ---
let lastJson = null;      // Stores the uploaded data
let lastColumns = null;   // Stores the current columns
let departmentShortNameMapArabic = {};
let departmentShortNameMapEnglish = {};

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

  // --- Button: Upload Department Mapping ---
  document.getElementById('deptMapUploadBtn').onclick = function() {
    const fileInput = document.getElementById('deptMapFileInput');
    const statusDiv = document.getElementById('deptMapStatus');
    // Remove any previous mapping table and toggle title
    const oldTable = document.getElementById('deptMapTable');
    if (oldTable) oldTable.remove();
    const oldToggle = document.getElementById('deptMapToggle');
    if (oldToggle) oldToggle.remove();
    if (!fileInput.files.length) {
      statusDiv.textContent = 'Please select a department mapping file.';
      statusDiv.style.color = '#ff2d42';
      return;
    }
    const file = fileInput.files[0];
    const reader = new FileReader();
    reader.onload = function(e) {
      const data = new Uint8Array(e.target.result);
      const workbook = XLSX.read(data, { type: 'array' });
      const sheetName = workbook.SheetNames[0];
      const worksheet = workbook.Sheets[sheetName];
      const json = XLSX.utils.sheet_to_json(worksheet, { defval: '' });
      departmentShortNameMapArabic = {};
      departmentShortNameMapEnglish = {};
      const mappingRows = [];
      json.forEach(row => {
        const arabic = row['department in arabic'] || row['Department in Arabic'] || row['arabic'] || row['Arabic'] || '';
        const english = row['department name in english'] || row['Department name in english'] || row['department in english'] || row['Department in English'] || row['english'] || row['English'] || '';
        const shortName = row['short name for department'] || row['Short name for department'] || row['short'] || row['Short'] || '';
        if (arabic && shortName) {
          departmentShortNameMapArabic[arabic.trim()] = shortName.trim();
        }
        if (english && shortName) {
          departmentShortNameMapEnglish[english.trim().toLowerCase()] = shortName.trim();
        }
        if ((arabic || english) && shortName) {
          mappingRows.push({ arabic: arabic.trim(), english: english.trim(), short: shortName.trim() });
        }
      });
      if (Object.keys(departmentShortNameMapArabic).length === 0 && Object.keys(departmentShortNameMapEnglish).length === 0) {
        statusDiv.textContent = 'No valid mappings found. Please check your file.';
        statusDiv.style.color = '#ff2d42';
      } else {
        statusDiv.textContent = 'Department mapping uploaded successfully!';
        statusDiv.style.color = '#4caf50';
        // Add toggleable title
        const toggle = document.createElement('div');
        toggle.id = 'deptMapToggle';
        toggle.textContent = 'Show Department Mapping Table ▼';
        toggle.style.cursor = 'pointer';
        toggle.style.fontWeight = '600';
        toggle.style.marginTop = '12px';
        toggle.style.color = '#ff2d42';
        statusDiv.parentNode.appendChild(toggle);
        // Create mapping table (hidden by default)
        const table = document.createElement('table');
        table.id = 'deptMapTable';
        table.style.marginTop = '8px';
        table.style.background = '#232429';
        table.style.color = '#fff';
        table.style.borderCollapse = 'collapse';
        table.style.width = '100%';
        table.style.display = 'none';
        table.innerHTML = `
          <thead><tr>
            <th style="padding:8px 6px; border-bottom:1px solid #393a3f;">Arabic Name</th>
            <th style="padding:8px 6px; border-bottom:1px solid #393a3f;">English Name</th>
            <th style="padding:8px 6px; border-bottom:1px solid #393a3f;">Short Name</th>
          </tr></thead>
          <tbody>
            ${mappingRows.map(row => `
              <tr>
                <td style="padding:8px 6px; border-bottom:1px solid #393a3f;">${row.arabic}</td>
                <td style="padding:8px 6px; border-bottom:1px solid #393a3f;">${row.english}</td>
                <td style="padding:8px 6px; border-bottom:1px solid #393a3f; color:#ff2d42; font-weight:600;">${row.short}</td>
              </tr>
            `).join('')}
          </tbody>
        `;
        statusDiv.parentNode.appendChild(table);
        // Toggle logic
        let shown = false;
        toggle.onclick = function() {
          shown = !shown;
          table.style.display = shown ? '' : 'none';
          toggle.textContent = (shown ? 'Hide' : 'Show') + ' Department Mapping Table ' + (shown ? '▲' : '▼');
        };
        // --- NEW: If employee data is loaded, re-map and re-render ---
        if (lastJson && lastColumns) {
          // Remove Employee ID column if present
          lastColumns = lastColumns.filter(col => col !== 'Employee ID');
          // Re-map department
          lastJson.forEach(row => {
            const origDept = row['Department'];
            if (departmentShortNameMapArabic && departmentShortNameMapArabic[origDept]) {
              row['Department'] = departmentShortNameMapArabic[origDept];
            } else if (departmentShortNameMapEnglish && departmentShortNameMapEnglish[origDept && origDept.toLowerCase()]) {
              row['Department'] = departmentShortNameMapEnglish[origDept.toLowerCase()];
            }
          });
          // Re-render table
          renderTable(lastJson, lastColumns);
          // If Employee ID column was present, re-generate IDs
          const patternSelect = document.getElementById('patternSelect');
          if (patternSelect && document.getElementById('generateIdBtn').style.display !== 'none') {
            generateEmployeeIDs();
          }
        }
      }
    };
    reader.onerror = function() {
      statusDiv.textContent = 'Error reading department mapping file.';
      statusDiv.style.color = '#ff2d42';
      const oldTable = document.getElementById('deptMapTable');
      if (oldTable) oldTable.remove();
      const oldToggle = document.getElementById('deptMapToggle');
      if (oldToggle) oldToggle.remove();
    };
    reader.readAsArrayBuffer(file);
  };
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
  const exportBtn = document.getElementById('exportBtn');

  // Remove any existing pattern dropdown and label
  const oldLabel = document.getElementById('patternLabel');
  const oldSelect = document.getElementById('patternSelect');
  if (oldLabel) oldLabel.remove();
  if (oldSelect) oldSelect.remove();

  // Check if a file is selected
  if (!fileInput.files.length) {
    showStatus('Please select a file.', true);
    tablePreview.innerHTML = '';
    generateIdBtn.style.display = 'none';
    exportBtn.style.display = 'none';
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
      exportBtn.style.display = 'none';
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
      exportBtn.style.display = 'none';
      return;
    }
    json = json.map(row => {
      const filtered = {};
      requiredColumns.forEach(col => filtered[col] = row[col]);
      // Replace department with short name if mapping exists (Arabic first, then English)
      if (filtered['Department']) {
        if (departmentShortNameMapArabic && departmentShortNameMapArabic[filtered['Department']]) {
          filtered['Department'] = departmentShortNameMapArabic[filtered['Department']];
        } else if (departmentShortNameMapEnglish && departmentShortNameMapEnglish[filtered['Department'].toLowerCase()]) {
          filtered['Department'] = departmentShortNameMapEnglish[filtered['Department'].toLowerCase()];
        }
      }
      return filtered;
    });

    // Store for later use
    lastJson = json;
    lastColumns = [...requiredColumns];

    // Show table
    renderTable(json, lastColumns);
    showStatus('File uploaded and parsed successfully!');
    generateIdBtn.style.display = 'inline-block';
    exportBtn.style.display = 'none';

    // Dynamically create and insert the pattern dropdown and label above the Generate ID button
    const label = document.createElement('label');
    label.id = 'patternLabel';
    label.htmlFor = 'patternSelect';
    label.textContent = 'Choose ID Pattern:';
    label.style.display = 'block';
    label.style.marginTop = '20px';
    label.style.color = '#fff';
    label.style.fontWeight = '500';
    label.style.fontSize = '1rem';

    const select = document.createElement('select');
    select.id = 'patternSelect';
    select.style.background = '#232429';
    select.style.color = '#fff';
    select.style.border = '1px solid #393a3f';
    select.style.borderRadius = '8px';
    select.style.padding = '10px 16px';
    select.style.fontSize = '1rem';
    select.style.fontFamily = 'Montserrat, Arial, sans-serif';
    select.style.fontWeight = '500';
    select.style.marginBottom = '16px';
    select.style.marginRight = '12px';
    select.style.outline = 'none';
    select.style.transition = 'border 0.2s';
    select.style.boxShadow = 'none';

    select.innerHTML = `
      <option value="pattern1">[Department] - [Year] - [Month][Day]</option>
      <option value="pattern2">[Year][Month][Day] - [Department]</option>
      <option value="pattern3">[Department]-[Old ID number]-[Year]</option>
      <option value="pattern4">[Year]-[Department]-[Employee name initials]</option>
      <option value="pattern5">[Department]-[Year]-[Serial Number]</option>
    `;

    // Insert label and select before the Generate ID button
    const parent = generateIdBtn.parentNode;
    parent.insertBefore(label, generateIdBtn);
    parent.insertBefore(select, generateIdBtn);
  };
  reader.onerror = function() {
    showStatus('Error reading file.', true);
    tablePreview.innerHTML = '';
    generateIdBtn.style.display = 'none';
    exportBtn.style.display = 'none';
    // Remove dropdown and label if present
    const oldLabel = document.getElementById('patternLabel');
    const oldSelect = document.getElementById('patternSelect');
    if (oldLabel) oldLabel.remove();
    if (oldSelect) oldSelect.remove();
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
  // Get selected pattern
  const patternSelect = document.getElementById('patternSelect');
  const pattern = patternSelect ? patternSelect.value : 'pattern1';

  if (pattern === 'pattern5') {
    // [Department]-[Year]-[Serial Number] (serial per department and year)
    let rowsWithDeptYear = lastJson.map((row, idx) => {
      let dateVal = row['Joining date'];
      if (typeof dateVal === 'number') dateVal = formatDateString(dateVal);
      let year = '';
      let dateObj = null;
      if (dateVal) {
        const d = new Date(dateVal);
        if (!isNaN(d)) {
          year = d.getFullYear();
          dateObj = d;
        } else {
          const parts = dateVal.split(/[-\/]/);
          if (parts.length >= 3) {
            year = parts[0];
            dateObj = new Date(dateVal);
          }
        }
      }
      const dept = row['Department'] || '';
      return {
        idx,
        dept,
        year,
        dateObj: dateObj || new Date(0),
        row
      };
    });
    // Group by department and year
    const deptYearGroups = {};
    rowsWithDeptYear.forEach(item => {
      const key = `${item.dept}||${item.year}`;
      if (!deptYearGroups[key]) deptYearGroups[key] = [];
      deptYearGroups[key].push(item);
    });
    // For each group, sort by date and assign serial number
    Object.values(deptYearGroups).forEach(group => {
      group.sort((a, b) => a.dateObj - b.dateObj);
      group.forEach((item, i) => {
        const serial = String(i + 1).padStart(2, '0');
        item.row['Employee ID'] = `${item.dept}-${item.year}-${serial}`;
      });
    });
  } else {
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
      const oldId = row['Old ID number'] || '';
      const empName = row['Employee name'] || '';
      const initials = empName.split(' ').map(w => w[0] ? w[0].toUpperCase() : '').join('');
      let empId = '';
      if (pattern === 'pattern1') {
        empId = `${dept} - ${year} - ${month}${day}`;
      } else if (pattern === 'pattern2') {
        empId = `${year}${month}${day} - ${dept}`;
      } else if (pattern === 'pattern3') {
        empId = `${dept}-${oldId}-${year}`;
      } else if (pattern === 'pattern4') {
        empId = `${year}-${dept}-${initials}`;
      }
      row['Employee ID'] = empId;
    });
  }
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

// --- Utility: Convert Excel serial date to YYYY-MM-DD (robust, matches Excel exactly) ---
function excelDateToJSDate(serial) {
  // Excel's epoch starts at 1899-12-31
  const excelEpoch = new Date(1899, 11, 31);
  let days = Math.floor(serial);
  if (days > 59) days -= 1;
  // Add 1 day to match Excel's display
  days += 1;
  const result = new Date(excelEpoch.getTime() + days * 24 * 60 * 60 * 1000);
  return result;
}
function formatDateString(val) {
  if (typeof val === 'number') {
    const d = excelDateToJSDate(val);
    const yyyy = d.getFullYear();
    const mm = String(d.getMonth() + 1).padStart(2, '0');
    const dd = String(d.getDate()).padStart(2, '0');
    return `${yyyy}-${mm}-${dd}`;
  }
  // Parse date string as YYYY-MM-DD (no timezone shift)
  if (typeof val === 'string' && /^\d{4}-\d{2}-\d{2}$/.test(val)) {
    return val;
  }
  // Parse date string as DD/MM/YYYY or MM/DD/YYYY (Excel export)
  if (typeof val === 'string' && /^(\d{2})[\/\-](\d{2})[\/\-](\d{4})$/.test(val)) {
    const parts = val.split(/[\/\-]/);
    const d = new Date(Number(parts[2]), Number(parts[1]) - 1, Number(parts[0]) + 1); // Add 1 to day
    const yyyy = d.getFullYear();
    const mm = String(d.getMonth() + 1).padStart(2, '0');
    const dd = String(d.getDate()).padStart(2, '0');
    return `${yyyy}-${mm}-${dd}`;
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