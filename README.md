# dst-fist-microgrid

Website for the Research Lab of DST FIST Microgrid Lab, Ground Floor, Department of Power Engineering, Jadavpur University.

Developed by **Sarin Sanyal** (UG Batch of '28, Department of Power Engineering).

---

## Google Sheets Maintenance Guide

This document outlines the operational rules, column specifications, and formatting standards for maintaining the DST FIST Microgrid Lab web database. 

All site content is dynamically populated from these sheets. 

**After editing in the Sheet, it would take some time to reflect the changes, so please wait for atmost a minute.**

Strictly following these guidelines prevents parsing errors, broken layout cards, and missing visual assets.

---

### 1. Sheet Schemas & Data Types

Ensure column headers match these field names **exactly** (case-sensitive, lowercase, with underscores where specified).

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
| `date` | String | **Yes** | Standard date format (`YYYY-MM-DD`). | `2026-08-15` |
| `headline` | String | **Yes** | Plain text title. Avoid HTML tags. | `DST Grant Approved` |
| `summary` | String | **Yes** | Short summary paragraph. | `The lab received funding for...` |
| `image_url` | String | No | Direct image stream URL (see Google Drive instructions). | `https://lh3.googleusercontent.com/d/1A...` |
| `link` | String | No | External URL for "Read More" actions. | `https://example.com/announcement` |
| `category` | String | No | Category badge tag. | `Grant` or `Publication` |

#### Tab: `Projects`
| Column Header | Type | Required | Formatting & Constraints | Example Value |
| :--- | :--- | :--- | :--- | :--- |
| `title` | String | **Yes** | Title of the research project. | `Microgrid Voltage Stability Analysis` |
| `description` | String | **Yes** | Overview of objectives and tech scope. | `Investigating AI-driven control...` |
| `imageUrl` | String | No | Direct image stream URL. | `https://lh3.googleusercontent.com/d/1A...` |
| `status` | String | **Yes** | Project state (`Ongoing` or `Completed`). | `Ongoing` |
| `link` | String | No | External project site or repository URL. | `https://github.com/...` |
| `funding_agency` | String | No | Sponsoring body name. | `DST-FIST` |
| `grant_amount` | String | No | Formatted currency string or text. | `₹25,000,000` |

#### Tab: `Publications`
| Column Header | Type | Required | Formatting & Constraints | Example Value |
| :--- | :--- | :--- | :--- | :--- |
| `title` | String | **Yes** | Title of the research paper. | `Real-Time Digital Simulation of AC Microgrids` |
| `authors` | String | **Yes** | Author names separated by commas. | `P. Purkait, S. Sanyal` |
| `journal` | String | **Yes** | Journal or conference name. | `IEEE Transactions on Smart Grid` |
| `year` | String / Num | **Yes** | Four-digit publication year. | `2026` |
| `doi` | String | No | DOI identifier link or string. | `10.1109/TSG.2026.XXXXXX` |
| `url` | String | No | Direct paper/IEEE Xplore URL. | `https://ieeexplore.ieee.org/...` |

#### Tab: `Awards`
| Column Header | Type | Required | Formatting & Constraints | Example Value |
| :--- | :--- | :--- | :--- | :--- |
| `title` | String | **Yes** | Name of the award or honor. | `Best Paper Award` |
| `recipient` | String | **Yes** | Awardee name(s). | `Dr. Prithwiraj Purkait` |
| `organization` | String | **Yes** | Awarding institution or body. | `IEEE Power & Energy Society` |
| `year` | String / Num | **Yes** | Four-digit year of conferral. | `2026` |
| `description` | String | No | Brief context regarding the recognition. | `Awarded for pioneering work in...` |

#### Tab: `Opportunities`
| Column Header | Type | Required | Formatting & Constraints | Example Value |
| :--- | :--- | :--- | :--- | :--- |
| `role` | String | **Yes** | Position title. | `Junior Research Fellow (JRF)` |
| `type` | String | **Yes** | Employment or position type. | `Full-Time` |
| `description` | String | **Yes** | Detailed overview of responsibilities. | `Work on hardware-in-the-loop testing...` |
| `eligibility` | String | **Yes** | Qualifications required. | `M.Tech in Power Systems or GATE qualified` |
| `deadline` | String | **Yes** | Date (`YYYY-MM-DD`) or `Rolling`. | `2026-10-15` |
| `apply_link` | String | No | Application form or contact mail link. | `https://forms.gle/...` |

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
   `https://drive.google.com/file/d/1ABC123xyz_FILE_ID/view?usp=sharing`
4. Extract the `FILE_ID` (`1ABC123xyz_FILE_ID`) and convert it into the direct stream format:
   `https://lh3.googleusercontent.com/d/1ABC123xyz_FILE_ID`
5. Paste the converted `lh3.googleusercontent.com` URL into the sheet's image column (`photoUrl`, `image_url`, `imageUrl`).

---

### 4. General Formatting Guidelines

* **Comma-Separated Values (CSV Parsing):**
  * In columns like `achievements` or `authors`, separate items with a comma (`,`).
  * *Do not* use inline line breaks (`Alt + Enter`), dashes (`-`), or bullet points (`•`) inside Google Sheet cells. The frontend parser handles formatting automatically.
* **Empty Cells:**
  * Leave optional cells blank rather than writing `N/A`, `none`, or `-`. Blank values safely hide unused UI buttons and attributes.
* **Quotes and Special Characters:**
  * Avoid putting double-quotes (`"`) inside text cells. If necessary, use single quotes (`'`) to avoid breaking CSV column alignment during exports.
* **Automatic Republishing:**
  * Ensure the sheet remains published by verifying **File** -> **Share** -> **Publish to Web** has **"Automatically republish when changes are made"** checked. Changes take up to 1 minute to reflect on the live website.
