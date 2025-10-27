# 📧 UniMail - KKWIEER

> A professional email management system for K.K. Wagh Institute of Engineering Education and Research

🌐 **Live Demo:** [https://unimail-kkwieer.vercel.app/](https://unimail-kkwieer.vercel.app/)

***

## 📋 About

UniMail is a web-based institutional email management application built as a mini project for Database Management Systems (DBMS) course. It demonstrates practical implementation of database operations with a modern glassmorphism user interface, specifically designed for managing official correspondence at KKWIEER.

**Academic Details:**
- **Course:** Database Management Systems (DBMS)
- **Class:** TY-A Computer Engineering
- **Institution:** K.K. Wagh Institute of Engineering Education and Research
- **Year:** 2024-2025

***

## 👥 Team Members

| Name | Role |
|------|------|
| Hrishikesh Gavai | Developer |
| Dhruvesh Patil | Developer |
| Nakshatra Rao | Developer |
| Palak Lokwani | Developer |

***

## ✨ Key Features

### Core Functionality
- 📝 **Email Composer** - Create and save professional institutional emails
- 👥 **Contact Management** - Pre-loaded Principal, Deans, and HOD contacts
- 🌍 **Multi-Language Support** - Automatic translation to Hindi and Marathi
- 📎 **PDF Attachments** - Upload and manage PDF files (up to 40MB)
- 🔗 **Gmail Integration** - Open composed emails directly in Gmail with translations

### Database Features
- 🗄️ **PostgreSQL Storage** - All records stored securely via Supabase
- 🔍 **Advanced Search** - Find emails by date, sender, recipient, or content
- 📊 **Excel Export** - Download records with clickable PDF links
- 📈 **Sortable Columns** - Sort by date, sender, recipient, or subject
- 🔄 **Real-time Sync** - Instant data updates across sessions

### User Experience
- 🎨 **Glassmorphism UI** - Modern frosted glass design with Unsplash background
- 🌓 **Pitch Black Theme** - Professional dark accents with clean aesthetics
- 📱 **Fully Responsive** - Seamless experience on desktop, tablet, and mobile
- 🔔 **Toast Notifications** - Real-time feedback for all operations
- 🔐 **Secure Login** - Session-based authentication

***

## 🛠️ Technology Stack

**Frontend:**
- React.js 18.2.0 - UI framework with hooks
- CSS3 with CSS Variables - Theming & animations
- Lucide React - 300+ beautiful icons
- React Hot Toast - Elegant notifications

**Backend & Database:**
- Supabase - PostgreSQL database (6 tables)
- Supabase Storage - PDF file management
- Row Level Security (RLS) - Data protection

**External APIs:**
- MyMemory Translation API - Hindi/Marathi translation
- Gmail Compose API - Email integration

**Development Tools:**
- Create React App - Project scaffolding
- XLSX - Excel export functionality
- Git & GitHub - Version control

**Hosting:**
- Vercel - Frontend deployment (CI/CD)
- Supabase Cloud - Database & storage hosting

***

## 📂 Database Schema

### Tables Overview

#### 1. **email_records** (Main Table)
```sql
CREATE TABLE public.email_records (
  id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  from_user       TEXT NOT NULL,
  to_user         TEXT NOT NULL,
  subject         TEXT NOT NULL,
  content         TEXT NOT NULL,
  subject_hindi   TEXT,
  content_hindi   TEXT,
  subject_marathi TEXT,
  content_marathi TEXT,
  pdf_filename    TEXT,
  sent_date       DATE NOT NULL,
  created_at      TIMESTAMPTZ DEFAULT NOW()
);
```

#### 2. **users** (Authentication)
```sql
CREATE TABLE public.users (
  id         UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  username   TEXT UNIQUE NOT NULL,
  password   TEXT NOT NULL,
  full_name  TEXT,
  email      TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  last_login TIMESTAMPTZ
);

CREATE INDEX users_username_idx ON public.users (username);
```

#### 3. **admin** (Admin Contacts)
```sql
CREATE TABLE public.admin (
  id         UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  email      TEXT UNIQUE NOT NULL,
  name       TEXT NOT NULL,
  department TEXT DEFAULT 'Administration',
  created_at TIMESTAMPTZ DEFAULT timezone('utc', NOW())
);
```

#### 4. **principal** (Principal Contacts)
```sql
CREATE TABLE public.principal (
  id         UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  email      TEXT UNIQUE NOT NULL,
  name       TEXT NOT NULL,
  department TEXT DEFAULT 'Principal Office',
  created_at TIMESTAMPTZ DEFAULT timezone('utc', NOW())
);
```

#### 5. **deans** (Dean Contacts)
```sql
CREATE TABLE public.deans (
  id         UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  email      TEXT UNIQUE NOT NULL,
  name       TEXT NOT NULL,
  department TEXT DEFAULT 'Dean Office',
  created_at TIMESTAMPTZ DEFAULT timezone('utc', NOW())
);
```

#### 6. **hod** (HOD Contacts)
```sql
CREATE TABLE public.hod (
  id         UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  email      TEXT UNIQUE NOT NULL,
  name       TEXT NOT NULL,
  department TEXT NOT NULL,
  created_at TIMESTAMPTZ DEFAULT timezone('utc', NOW())
);
```

### Storage Bucket
- **Bucket Name:** `pdfs`
- **Max File Size:** 40MB per file
- **File Types:** PDF only
- **Access:** Authenticated users

***

## 🔄 CRUD Operations Implementation

| Operation | Feature | SQL/API Used |
|-----------|---------|--------------|
| **CREATE** | Insert email records | `INSERT INTO email_records` |
| | Upload PDF files | Supabase Storage Upload |
| | Add contacts | `INSERT INTO admin/principal/deans/hod` |
| **READ** | Fetch all emails | `SELECT * FROM email_records` |
| | Search emails | `WHERE subject ILIKE / to_user ILIKE` |
| | Load contacts | `SELECT email FROM admin/principal/deans/hod` |
| **UPDATE** | Translate to Hindi | MyMemory API + `UPDATE email_records` |
| | Translate to Marathi | MyMemory API + `UPDATE email_records` |
| | Update last login | `UPDATE users SET last_login` |
| **DELETE** | Remove recipients | React state management |
| | Remove PDF attachments | Supabase Storage Delete |

***

## 🚀 Local Setup

### Prerequisites
```bash
Node.js >= 16.0.0
npm >= 8.0.0
Git
Supabase account (free tier)
```

### Installation Steps

1. **Clone the repository**
```bash
git clone https://github.com/Hrishikesh-Gavai/UniMail-KKWIEER.git
cd UniMail-KKWIEER
```

2. **Install dependencies**
```bash
npm install
```

3. **Configure environment variables**

Create a `.env` file in the root directory:
```env
REACT_APP_SUPABASE_URL=your_supabase_project_url
REACT_APP_SUPABASE_ANON_KEY=your_supabase_anon_key
```

Get your credentials from [Supabase Dashboard](https://app.supabase.com) → Project Settings → API

4. **Set up Supabase database**

Run the SQL schema provided above in Supabase SQL Editor:
- Create all 6 tables
- Create the `pdfs` storage bucket
- Insert sample data for testing

5. **Start development server**
```bash
npm start
```

Visit `http://localhost:3000` to view the application.

6. **Build for production**
```bash
npm run build
```

***

## 📦 Dependencies

```json
{
  "dependencies": {
    "@supabase/supabase-js": "^2.38.0",
    "lucide-react": "^0.263.1",
    "react": "^18.2.0",
    "react-dom": "^18.2.0",
    "react-hot-toast": "^2.4.1",
    "xlsx": "^0.18.5"
  }
}
```

***

## 📸 Features Deep Dive

### 1. Email Composition
- **Smart Recipient Management** - Add emails manually or via quick select dropdown
- **Validation** - Real-time email format validation
- **Contact Organization** - Grouped by Principal, Deans, and HOD
- **Drag & Drop Upload** - Intuitive PDF file upload with duplicate detection
- **Auto-save** - Form data persists across sessions

### 2. Database Management
- **Real-time Sync** - Instant updates using Supabase subscriptions
- **Advanced Search** - Search across all fields simultaneously
- **Date Filtering** - Filter records by specific dates
- **Column Sorting** - Click headers to sort ascending/descending
- **Expandable Rows** - View full content without cluttering the table

### 3. Multi-Language Translation
- **One-Click Translation** - Translate subject and content independently
- **Hindi Support** - Powered by MyMemory Translation API
- **Marathi Support** - Regional language for Maharashtra
- **Original Preservation** - Both English and translated versions stored
- **Gmail Integration** - Translations included in Gmail compose

### 4. File Management
- **PDF Only** - Restricted to PDF format for security
- **Size Limit** - 40MB maximum per file
- **Duplicate Detection** - Warns before overwriting existing files
- **Alternative Suggestions** - Auto-generates unique filenames
- **Public URL Generation** - Shareable download links

### 5. Data Export
- **Excel Format** - XLSX file generation
- **Clickable Links** - PDF download links in Excel
- **Full Records** - All fields including translations
- **Formatted Dates** - Human-readable date format

***

## 🎯 Learning Outcomes

This project demonstrates mastery of:

### Database Concepts
- Relational database design
- Primary and foreign key constraints
- Indexing for query optimization
- CRUD operations
- Transaction management
- Data normalization (3NF)

### Backend Development
- RESTful API integration
- Supabase client usage
- Authentication & authorization
- File storage management
- Error handling & validation

### Frontend Development
- React component architecture
- State management with hooks
- Async/await operations
- Form validation
- Responsive design principles
- CSS custom properties

### Software Engineering
- Version control with Git
- Cloud deployment
- Environment configuration
- Code organization
- User experience design

***

## 🔒 Security Features

- ✅ Session-based authentication
- ✅ Environment variable protection
- ✅ Input validation & sanitization
- ✅ File type restrictions
- ✅ Size limit enforcement
- ✅ Duplicate file detection
- ⚠️ **Note:** Designed for internal institutional use

***

## 📞 Contact & Support

**Project Lead:**  
**Hrishikesh Gavai**  
📧 Email: [hrishikeshgavai@gmail.com](mailto:hrishikeshgavai@gmail.com)  
🐙 GitHub: [@Hrishikesh-Gavai](https://github.com/Hrishikesh-Gavai)  
🔗 LinkedIn: [Hrishikesh Gavai](https://www.linkedin.com/in/hrishikesh-gavai)

**Institution:**  
K.K. Wagh Institute of Engineering Education and Research  
Nashik, Maharashtra, India

***

## 📄 License

This project is created for educational purposes as part of the DBMS curriculum at K.K. Wagh Institute of Engineering Education and Research.

**2025 UniMail - KKWIEER**

***

## 🙏 Acknowledgments

- **Faculty Guide** - DBMS Course Professor
- **Department of Computer Engineering** - K.K. Wagh Institute
- **Supabase Team** - Database infrastructure
- **React Community** - Open-source libraries
- **Unsplash** - Background imagery

***

<div align="center">

**Made with ❤️ by TY-A Computer Engineering Students**

🎓 **Academic Year 2025-2026**

© 2025 UniMail - KKWIEER | Database Management Systems Mini Project

</div>
