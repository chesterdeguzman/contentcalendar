# Content Calendar Approval Dashboard

A GitHub-ready interactive content calendar for monthly social media planning and client approval.

## Included brands

- Ely Roofing
- TWF
- Cottage Wellness
- Bullens Jewellery
- N-Ergise
- Hemstocks Jewellery
- Tannery
- Newrooms
- Blossoms
- Dr Libby
- Poringland Dental
- Pollard and Read
- Studio 5
- Cats at Home

## Main features

- Brand selector
- Month selector
- Four weekly sections
- Add, edit, duplicate, and delete content
- Content categories:
  - Carousel
  - Static
  - Memorable Day / Special Day
  - Reel
  - Talking Head
- Approve, Revise, Reject, and Pending statuses
- Client notes
- Caption and visual direction fields
- Platform, content pillar, reference link, and assignee fields
- Monthly targets:
  - 12 total contents
  - 8 carousels
  - 4 reels
- Progress dashboard
- Search and filters
- Board and table layouts
- Brand overview
- Add and remove brands
- Local browser saving
- JSON backup export and import
- Responsive design

## Important note about storage

This version uses `localStorage`, so data is saved in the browser and device being used.

If you send the GitHub link to a client, their changes will be saved only in their own browser. They will not automatically sync back to your device.

For shared real-time approval between you and the client, connect the website to a database such as:

- Supabase
- Firebase
- Airtable
- Google Sheets API

## Run locally

Open `index.html` in a browser.

For best results, use a local development server.

### VS Code Live Server

1. Open the folder in VS Code.
2. Install the Live Server extension.
3. Right-click `index.html`.
4. Select **Open with Live Server**.

## Upload to GitHub Pages

1. Create a new GitHub repository.
2. Upload:
   - `index.html`
   - `styles.css`
   - `script.js`
3. Open **Settings** in the repository.
4. Go to **Pages**.
5. Under **Build and deployment**, select:
   - Source: **Deploy from a branch**
   - Branch: **main**
   - Folder: **/root**
6. Save.
7. GitHub will generate a public website link.

## Backup workflow

Before changing devices or browsers:

1. Click **Export JSON**.
2. Save the backup file.
3. On the other device, click **Import JSON**.
4. Select the saved backup file.
