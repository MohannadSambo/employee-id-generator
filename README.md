# Employee ID Generator

A modern web app for generating employee IDs from Excel files or for a single employee, with a beautiful, responsive dark UI.

## Features
- **Bulk (Excel) Mode:** Upload an Excel file with employee data, generate IDs for all, and export the result.
- **Single Employee Mode:** Enter one employee's info, select a pattern, and generate an ID instantly.
- **Department Mapping:** Upload a mapping file to convert department names (Arabic/English) to short names.
- **Pattern Selection:** Choose from multiple ID patterns for both bulk and single modes.
- **Responsive UI:** Works beautifully on desktop, tablet, and mobile.

## User Flow

### Bulk (Excel) Mode
1. **Download Template:** Click "Download Excel Template" to get a blank file with required columns.
2. **Fill Template:** Enter employee data in Excel. Do not add or remove columns.
3. **Upload File:** Click "Upload" and select your filled Excel file. Only the required columns are accepted.
4. **(Optional) Upload Department Mapping:** Upload a mapping file to use short names for departments.
5. **Generate IDs:** Choose a pattern and click "Generate ID". The app adds a new column with generated IDs.
6. **Export:** Download the updated Excel file with the new Employee ID column.

### Single Employee Mode
1. **Switch to Single Employee tab.**
2. **Enter Employee Info:** Fill in the form fields.
3. **Select Department:** Choose from mapped short names (if mapping uploaded) or enter manually.
4. **Choose Pattern:** Select the desired ID pattern.
5. **Generate:** Click "Generate ID" to see the result instantly.

### Department Mapping
- Upload a mapping Excel file with columns for Arabic name, English name, and short name.
- The app will use the short name for department in all ID generation.
- You can view/hide the mapping table after upload.
- Changing the mapping updates all generated IDs and tables automatically.

## Code Structure
- **main.js:** All UI and logic, organized into clear sections: UI setup, tab logic, department mapping, bulk mode, single mode, utilities.
- **style.css:** Modern, responsive dark theme with refined controls and layout.
- **index.html:** Minimal, loads the app and styles.

## Working with Git, GitHub, and Deployment

### How to Save and Deploy Your Changes
- You can make as many changes as you want on your computer.
- **Your app online (Vercel/Netlify) only updates when you push to GitHub.**
- You do **not** have to push after every small change. Push when you reach a meaningful milestone (finish a feature, fix a bug, or want to save your progress).

#### Typical Workflow
1. Make changes locally and test your app.
2. When ready, run:
   ```sh
   git add .
   git commit -m "Describe your changes"
   git push
   ```
3. Your remote app will update automatically.

### Best Practices
- Push whenever you want your changes to be saved to GitHub and deployed to your live app.
- You can push as often as you like, but it's not required after every change.
- If you work from another computer, just clone your repo, make changes, and push again.

---

Feel free to suggest or request more features! 