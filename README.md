# dst-fist-microgrid

Website for the Research Lab of DST FIST Microgrid Lab, Ground Floor, Department of Power Engineering, Jadavpur University.

Developed by **Sarin Sanyal** (UG Batch of '28, Department of Power Engineering).

---

## Google Sheets Maintenance Guide

This document outlines the operational rules, column specifications, and formatting standards for maintaining the DST FIST Microgrid Lab web database. 

All site content is dynamically populated from these sheets. Strictly following these guidelines prevents parsing errors, broken layout cards, and missing visual assets.

---

### 1. Sheet Schemas & Data Types

Ensure column headers match these field names **exactly** (case-sensitive, lowercase, with underscores).

#### Tab: `People`
| Column Header | Type | Required | Formatting & Constraints | Example Value |
| :--- | :--- | :--- | :--- | :--- |
| `name` | String | **Yes** | Full name with academic titles if applicable. | `Prithwiraj Purkait` |
| `role` | String | **Yes** | Must match one of the exact predefined roles (case-sensitive). | `Professor` |
| `email` | String | No | Valid email address for `mailto:` link. | `prajpurkait@gmail.com` |
| `achievements` | String | No | **Comma-separated list**. Each item creates a bullet point. | `IEEE Senior Member, Best Paper 2023` |
| `google_scholar`| String | No | Full URL starting with `https://` | `https://scholar.google.com/...` |
| `linkedin` | String | No | Full URL starting with `https://` | `https://linkedin.com/in/...` |
| `photoUrl` | String | No | Direct image stream URL (see Google Drive instructions). | `https://lh3.googleusercontent.com/d/1A...` |

#### Tab: `News`
| Column Header | Type | Required | Formatting & Constraints | Example Value |
| :--- | :--- | :--- | :--- | :--- |
| `id` | String / Num | **Yes** | Unique identifier per news item. | `news-101` |
| `title` | String | **Yes** | Plain text title. Avoid HTML tags. | `DST Grant Approved` |
| `date` | String | **Yes** | Standard date format (`YYYY-MM-DD` or `MMM DD, YYYY`). | `2026-04-15` |
| `category` | String | No | Category badge tag. | `Grant` or `Publication` |
| `content` | String | **Yes** | Short summary paragraph. | `The lab received funding for...` |
| `link` | String | No | External URL for "Read More" actions. | `https://example.com/announcement` |

---

### 2. Allowed Roles & Grouping Rules

The **`role`** column on the `People` tab controls card grouping and sorting order on the frontend. Values must match these exact strings:

* `Professor`
* `Post Doc Scholar`
* `PhD Student`
* `PG Research Scholar`
* `UG Research Scholar`

> **Critical Note:** Values like `professor` (lowercase) or `Professor in-charge` (extra words) will fail the exact string filter and hide the member from the primary section.

---

### 3. Formatting Google Drive Image URLs

Standard Google Drive view links (`drive.google.com/file/d/.../view`) return an HTML preview page instead of a raw image file, causing broken images on the website.

#### Conversion Procedure:
1. Upload the image to Google Drive.
2. Right-click the file -> **Share** -> Set Access to **"Anyone with the link"** (Role: **Viewer**).
3. Copy the link:
   ```text
   [https://drive.google.com/file/d/1ABC123xyz_FILE_ID/view?usp=sharing](https://drive.google.com/file/d/1ABC123xyz_FILE_ID/view?usp=sharing)```
4. Extract the `FILE_ID` (`1ABC123xyz_FILE_ID`) and convert it into the direct stream format:
   `https://lh3.googleusercontent.com/d/1ABC123xyz_FILE_ID`
5. Paste the converted `lh3.googleusercontent.com` URL into the sheet's `photoUrl` column.

---

### 4. General Formatting Guidelines

* **Comma-Separated Values (CSV Parsing):**
  * In columns like `achievements`, separate items with a comma (`,`).
  * *Do not* use inline line breaks (`Alt + Enter`), dashes (`-`), or bullet points (`•`) inside Google Sheet cells. The frontend parser handles bullet rendering automatically.
* **Empty Cells:**
  * Leave optional cells blank rather than writing `N/A`, `none`, or `-`. Blank values safely hide unused UI buttons (e.g., missing LinkedIn or Scholar links).
* **Quotes and Special Characters:**
  * Avoid putting double-quotes (`"`) inside text cells. If necessary, use single quotes (`'`) to avoid breaking CSV column alignment during exports.
* **Automatic Republishing:**
  * Ensure the sheet remains published by verifying **File** -> **Share** -> **Publish to Web** has **"Automatically republish when changes are made"** checked. Changes take up to 10 seconds to reflect on the live website.
