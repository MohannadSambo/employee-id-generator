# Employee ID Generator

A modern web app for generating employee IDs from Excel files, with a dark UI inspired by professional design kits.

## Description
This app allows HR or admin users to:
- Download a pre-formatted Excel template for employee data
- Upload a filled Excel file (with only the required columns)
- Preview the uploaded data in a stylish table
- Generate new Employee IDs for each row using a specific pattern
- Export the updated data (including the new IDs) back to Excel

## User Flow
1. **Download Template**
   - Click the "Download Excel Template" button to get a blank Excel file with the required columns: Employee name, Old ID number, Joining date, Department.
2. **Fill the Template**
   - Open the template in Excel and fill in employee data. Do not add or remove columns.
3. **Upload File**
   - Click the "Upload" button and select your filled Excel file. Only the required columns will be accepted; extra columns are ignored.
   - The app will validate the file and display the data in a table.
4. **Generate Employee IDs**
   - Click the "Generate ID" button. The app will add a new column with IDs in the format: `[Department] - [joining date year] - [joining date month] [joining date day]`.
5. **Export Updated File**
   - Download the updated Excel file with the new Employee ID column.

## Notes
- The app enforces the required columns and ignores any extra columns in uploaded files.
- Dates are automatically formatted for clarity.
- The UI is fully responsive and uses a modern dark theme.

---

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