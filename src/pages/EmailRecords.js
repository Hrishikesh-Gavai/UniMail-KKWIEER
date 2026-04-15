import React, { useState, useEffect, useRef } from "react";
import { supabase } from "../services/supabase";
import { showNotification } from "../utils/notifications";
import * as XLSX from "xlsx";
import {
  Database,
  Search,
  Calendar,
  RefreshCw,
  Download,
  FileText,
  Eye,
  Mail,
  Paperclip,
  FileDown,
  Filter,
  ChevronDown,
  ChevronUp,
  Trash2,
  AlertTriangle,
  MapPin,
  DollarSign,
  Type,
} from "lucide-react";

const EmailRecords = () => {
  const [emailRecords, setEmailRecords] = useState([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [searchTermRomanized, setSearchTermRomanized] = useState("");
  const [marathiSearchEnabled, setMarathiSearchEnabled] = useState(false);
  const [isTranslatingSearch, setIsTranslatingSearch] = useState(false);
  const [fromDate, setFromDate] = useState("");
  const [toDate, setToDate] = useState("");
  const [loading, setLoading] = useState(true);
  const [downloading, setDownloading] = useState({});
  const [postalUpdating, setPostalUpdating] = useState({});
  const [deleting, setDeleting] = useState({});
  const [sortConfig, setSortConfig] = useState({ key: "serial_number", direction: "asc" });
  const [expandedRow, setExpandedRow] = useState(null);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [recordToDelete, setRecordToDelete] = useState(null);

  const topScrollRef = useRef(null);
  const bottomScrollRef = useRef(null);
  const searchInputRef = useRef(null);

  const RECENT_LIMIT = 100; // Number of most recent emails to show when no date range

  // ========== MISSING FUNCTIONS ==========
  const toggleRowExpand = (id) => {
    setExpandedRow(expandedRow === id ? null : id);
  };

  const openDeleteModal = (id) => {
    setRecordToDelete(id);
    setShowDeleteModal(true);
  };

  const closeDeleteModal = () => {
    setShowDeleteModal(false);
    setRecordToDelete(null);
  };

  const confirmDelete = async () => {
    if (!recordToDelete) return;
    setDeleting((prev) => ({ ...prev, [recordToDelete]: true }));
    try {
      const { error } = await supabase
        .from("email_records")
        .delete()
        .eq("id", recordToDelete);
      if (error) throw error;
      setEmailRecords((prev) => prev.filter((r) => r.id !== recordToDelete));
      showNotification("Record deleted successfully", "success");
    } catch (error) {
      console.error("Error deleting record:", error);
      showNotification("Failed to delete record", "error");
    } finally {
      setDeleting((prev) => ({ ...prev, [recordToDelete]: false }));
      closeDeleteModal();
    }
  };
  // ============================================

  // ========== MARATHI TRANSLITERATION ==========
  const translateRomanizedMarathi = async (text) => {
    if (!text.trim()) {
      setSearchTerm("");
      setSearchTermRomanized("");
      return;
    }
    setIsTranslatingSearch(true);
    try {
      const response = await fetch(
        `https://inputtools.google.com/request?text=${encodeURIComponent(text)}&itc=mr-t-i0-und&num=1&cp=0&cs=1&ie=utf-8&oe=utf-8&app=demopage`
      );
      const data = await response.json();
      if (data?.[0] === "SUCCESS" && data[1]?.[0]?.[1]?.length > 0) {
        const translatedText = data[1][0][1][0];
        setSearchTerm(translatedText);
        setSearchTermRomanized(translatedText);
      } else {
        setSearchTerm(text);
        setSearchTermRomanized(text);
      }
    } catch {
      setSearchTerm(text);
      setSearchTermRomanized(text);
    } finally {
      setIsTranslatingSearch(false);
    }
  };

  useEffect(() => {
    const timeoutId = setTimeout(() => {
      if (marathiSearchEnabled && searchTermRomanized && searchTermRomanized !== searchTerm) {
        translateRomanizedMarathi(searchTermRomanized);
      }
    }, 500);
    return () => clearTimeout(timeoutId);
  }, [searchTermRomanized, marathiSearchEnabled]);

  const handleSearchInput = (e) => {
    const value = e.target.value;
    if (marathiSearchEnabled) {
      setSearchTermRomanized(value);
      if (!value.trim()) {
        setSearchTerm("");
      }
    } else {
      setSearchTerm(value);
      setSearchTermRomanized(value);
    }
  };

  const toggleMarathiSearchMode = () => {
    setMarathiSearchEnabled(!marathiSearchEnabled);
    if (!marathiSearchEnabled) {
      setSearchTermRomanized(searchTerm);
    } else {
      setSearchTermRomanized(searchTerm);
    }
  };
  // ============================================

  useEffect(() => {
    loadEmailRecords();
  }, []);

  const syncScroll = (source) => {
    if (source === "top" && bottomScrollRef.current) {
      bottomScrollRef.current.scrollLeft = topScrollRef.current.scrollLeft;
    } else if (source === "bottom" && topScrollRef.current) {
      topScrollRef.current.scrollLeft = bottomScrollRef.current.scrollLeft;
    }
  };

  const loadEmailRecords = async () => {
    const MIN_LOADING_MS = 800;
    const startTime = Date.now();
    try {
      setLoading(true);
      const { data, error } = await supabase
        .from("email_records")
        .select("*")
        .order("serial_number", { ascending: true });
      if (error) throw error;
      setEmailRecords(data || []);
      showNotification(`Loaded ${data?.length || 0} email records`, "success");
    } catch (error) {
      console.error("Error loading records:", error);
      showNotification("Failed to load email records", "error");
    } finally {
      const elapsed = Date.now() - startTime;
      const remaining = MIN_LOADING_MS - elapsed;
      if (remaining > 0) {
        setTimeout(() => setLoading(false), remaining);
      } else {
        setLoading(false);
      }
    }
  };

  const handleSort = (key) => {
    let direction = "desc";
    if (sortConfig.key === key && sortConfig.direction === "desc") {
      direction = "asc";
    }
    setSortConfig({ key, direction });
  };

  // Date filtering helper
  const isDateInRange = (recordDate) => {
    if (!recordDate) return false;
    const dateStr = new Date(recordDate).toISOString().split('T')[0];
    if (fromDate && toDate) {
      return dateStr >= fromDate && dateStr <= toDate;
    }
    if (fromDate) {
      return dateStr >= fromDate;
    }
    if (toDate) {
      return dateStr <= toDate;
    }
    return true; // no date filters active
  };

  // ========== NEW LOGIC: Filter + Recent Limit + Sort ==========
  // Step 1: Apply search and date filters to the full dataset
  const getFilteredRecords = () => {
    let filtered = [...emailRecords];

    // Apply search filter
    if (searchTerm) {
      const searchLower = searchTerm.toLowerCase();
      filtered = filtered.filter(
        (record) =>
          record.from_user?.toLowerCase().includes(searchLower) ||
          record.to_user?.toLowerCase().includes(searchLower) ||
          record.subject?.toLowerCase().includes(searchLower) ||
          record.content?.toLowerCase().includes(searchLower) ||
          record.subject_hindi?.toLowerCase().includes(searchLower) ||
          record.content_hindi?.toLowerCase().includes(searchLower) ||
          record.subject_marathi?.toLowerCase().includes(searchLower) ||
          record.content_marathi?.toLowerCase().includes(searchLower) ||
          record.place?.toLowerCase().includes(searchLower) ||
          record.remarks?.toLowerCase().includes(searchLower) ||
          record.serial_number?.toString().includes(searchLower)
      );
    }

    // Apply date range filter
    if (fromDate || toDate) {
      filtered = filtered.filter((record) => isDateInRange(record.sent_date));
    }

    return filtered;
  };

  // Step 2: If NO date range is set, limit to the most recent RECENT_LIMIT records (by sent_date)
  const applyRecentLimit = (records) => {
    if (fromDate || toDate) return records; // date range active → show all matching
    // Sort by sent_date descending and take first RECENT_LIMIT
    return [...records]
      .sort((a, b) => new Date(b.sent_date) - new Date(a.sent_date))
      .slice(0, RECENT_LIMIT);
  };

  // Step 3: Apply user sorting (serial_number, sent_date, to_user, etc.)
  const applySorting = (records) => {
    return [...records].sort((a, b) => {
      if (sortConfig.key === "sent_date" || sortConfig.key === "created_at") {
        return sortConfig.direction === "desc"
          ? new Date(b[sortConfig.key]) - new Date(a[sortConfig.key])
          : new Date(a[sortConfig.key]) - new Date(b[sortConfig.key]);
      }
      if (sortConfig.key === "serial_number") {
        return sortConfig.direction === "desc"
          ? b.serial_number - a.serial_number
          : a.serial_number - b.serial_number;
      }
      if (a[sortConfig.key] < b[sortConfig.key]) {
        return sortConfig.direction === "desc" ? 1 : -1;
      }
      if (a[sortConfig.key] > b[sortConfig.key]) {
        return sortConfig.direction === "desc" ? -1 : 1;
      }
      return 0;
    });
  };

  // Final displayed records
  const filteredRecords = (() => {
    const step1 = getFilteredRecords();
    const step2 = applyRecentLimit(step1);
    const step3 = applySorting(step2);
    return step3;
  })();

  // Helper to know if we are in "recent only" mode (for UI hint)
  const isRecentOnlyMode = !fromDate && !toDate;

  // ========== EXPORT: Uses the same filteredRecords (what the user sees) ==========
  const downloadExcel = async () => {
  try {
    if (filteredRecords.length === 0) {
      showNotification("No records to download", "warning");
      return;
    }

    const ExcelJS = await import('exceljs');
    const workbook = new ExcelJS.Workbook();
    const worksheet = workbook.addWorksheet('Email Records');

    // Set columns
    worksheet.columns = [
      { header: 'Serial No.', key: 'serialNo', width: 6 },
      { header: 'Date', key: 'date', width: 11 },
      { header: 'To Email', key: 'toEmail', width: 30 },
      { header: 'Place', key: 'place', width: 8 },
      { header: 'Sent by Post', key: 'sentByPost', width: 5 },
      { header: 'Description', key: 'description', width: 30 },
      { header: 'Stamp Received', key: 'stampReceived', width: 9 },
      { header: 'Stamp Affixed', key: 'stampAffixed', width: 8 },
      { header: 'Balance Left', key: 'balanceLeft', width: 8 },
      { header: 'Remarks', key: 'remarks', width: 15 }
    ];

    // Title row
    worksheet.getRow(1).height = 100;
    worksheet.mergeCells('A1:J1');
    const titleCell = worksheet.getCell('A1');
    titleCell.value = "K. K. WAGH EDUCATION SOCIETY'S, NASHIK.\nOUTWARD REGISTER";
    titleCell.font = { bold: true, size: 18 };
    titleCell.alignment = { horizontal: 'center', vertical: 'middle', wrapText: true };
    titleCell.border = {
      top: { style: 'thin' },
      left: { style: 'thin' },
      bottom: { style: 'thin' },
      right: { style: 'thin' }
    };

    // Header row
    const headerRow = worksheet.getRow(2);
    headerRow.values = [
      'Serial No.',
      'Date',
      'To Email',
      'Place',
      'Sent by Post',
      'Description',
      'Stamp Received',
      'Stamp Affixed',
      'Balance Left',
      'Remarks'
    ];
    headerRow.font = { bold: true };
    headerRow.alignment = { horizontal: 'center', vertical: 'middle', wrapText: true };
    headerRow.fill = {
      type: 'pattern',
      pattern: 'solid',
      fgColor: { argb: 'FFF0F0F0' }
    };
    headerRow.height = 60;

    headerRow.eachCell({ includeEmpty: true }, (cell) => {
      cell.border = {
        top: { style: 'thin' },
        left: { style: 'thin' },
        bottom: { style: 'thin' },
        right: { style: 'thin' }
      };
    });

    // Data rows
    filteredRecords.forEach((record, idx) => {
      const formattedEmails = record.to_user
        ? record.to_user.split(',').map(email => email.trim()).join('\n')
        : "";

      const row = worksheet.addRow([
        record.serial_number || idx + 1,
        new Date(record.sent_date).toLocaleDateString("en-GB"),
        formattedEmails,
        record.place || "",
        record.postal_sent ? "Yes" : "No",
        record.subject || "",
        record.stamp_received || 0,
        record.stamp_affixed || 0,
        record.balance_left || 0,
        record.remarks || ""
      ]);

      row.eachCell({ includeEmpty: true }, (cell) => {
        cell.border = {
          top: { style: 'thin' },
          left: { style: 'thin' },
          bottom: { style: 'thin' },
          right: { style: 'thin' }
        };
        cell.alignment = {
          horizontal: 'center',
          vertical: 'middle',
          wrapText: true
        };
      });
    });

    // 🔒 PROTECT THE WORKSHEET (read-only, no password required to open)
    worksheet.protect('');  // empty string = no password, but editing is disabled

    const buffer = await workbook.xlsx.writeBuffer();
    const blob = new Blob([buffer], { type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `email-records-${new Date().toISOString().split("T")[0]}.xlsx`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);

    showNotification("Excel file downloaded (read‑only protection applied)", "success");
  } catch (error) {
    console.error("Error generating Excel:", error);
    showNotification("Failed to generate Excel file", "error");
  }
};

  const downloadPdf = async (filename) => {
    setDownloading((prev) => ({ ...prev, [filename]: true }));
    try {
      const { data, error } = await supabase.storage.from("pdfs").download(filename);
      if (error) throw error;
      const url = URL.createObjectURL(data);
      const a = document.createElement("a");
      a.href = url;
      a.download = filename;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
      showNotification("PDF downloaded successfully", "success");
    } catch (error) {
      console.error("Error downloading PDF:", error);
      showNotification("Failed to download PDF", "error");
    } finally {
      setDownloading((prev) => ({ ...prev, [filename]: false }));
    }
  };

  useEffect(() => {
    const updateScrollWidth = () => {
      if (topScrollRef.current && bottomScrollRef.current) {
        const tableWidth = bottomScrollRef.current.firstChild?.scrollWidth || 0;
        if (topScrollRef.current.firstChild && tableWidth > 0) {
          topScrollRef.current.firstChild.style.width = `${tableWidth}px`;
        }
      }
    };
    updateScrollWidth();
    window.addEventListener("resize", updateScrollWidth);
    return () => window.removeEventListener("resize", updateScrollWidth);
  }, [filteredRecords]);

  const getSortIcon = (key) => {
    if (sortConfig.key !== key) return <ChevronDown size={16} style={{ opacity: 0.3 }} />;
    return sortConfig.direction === "desc" ? <ChevronDown size={16} /> : <ChevronUp size={16} />;
  };

  const clearAllFilters = () => {
    setSearchTerm("");
    setSearchTermRomanized("");
    setFromDate("");
    setToDate("");
    setMarathiSearchEnabled(false);
  };

  return (
    <div className="er-root">
      <link
        href="https://fonts.googleapis.com/css2?family=Playfair+Display:wght@400;500;600;700;800;900&family=DM+Mono:wght@300;400;500&display=swap"
        rel="stylesheet"
      />

      {/* Header */}
      <div className="er-header">
        <div className="er-header-left">
          <div className="er-header-icon">
            <Database size={22} strokeWidth={1.5} />
          </div>
          <div>
            <h1 className="er-title">EMAIL RECORDS</h1>
            <p className="er-subtitle">Manage and review all your sent emails</p>
          </div>
        </div>
      </div>

      {/* Filter Section */}
      <div className="er-section">
        <div className="er-section-label">
          <Filter size={15} strokeWidth={2} />
          <span>FILTER & SEARCH</span>
        </div>
        <div className="er-filters-grid">
          <div className="er-field">
            <div className="er-label-row">
              <label className="er-label">
                <Search size={14} strokeWidth={2} />
                SEARCH RECORDS
              </label>
              <button
                className={`er-toggle-btn ${marathiSearchEnabled ? "er-toggle-btn--active" : ""}`}
                onClick={toggleMarathiSearchMode}
              >
                <Type size={13} strokeWidth={2} />
                {marathiSearchEnabled ? "मराठी MODE ON" : "MARATHI MODE"}
              </button>
            </div>
            <div className="er-input-wrap">
              <input
                ref={searchInputRef}
                type="text"
                className="er-input"
                placeholder={marathiSearchEnabled ? "Type in Romanized Marathi (e.g., namaskar)…" : "Search by serial no., sender, recipient, subject, content, place, remarks..."}
                value={marathiSearchEnabled ? searchTermRomanized : searchTerm}
                onChange={handleSearchInput}
              />
              {isTranslatingSearch && (
                <span className="er-translating">
                  <RefreshCw size={11} strokeWidth={2} className="er-spin" />
                  Transliterating…
                </span>
              )}
            </div>
            <p className="er-hint">
              {marathiSearchEnabled
                ? "Type in Romanized Marathi, it will auto-convert to Devanagari in the search box"
                : "Search across all fields including translations"}
            </p>
          </div>
          <div className="er-field">
            <label className="er-label">
              <Calendar size={14} strokeWidth={2} />
              DATE RANGE
            </label>
            <div style={{ display: "flex", flexDirection: "column", gap: "0.75rem" }}>
              <div>
                <div style={{ fontSize: "0.7rem", marginBottom: "0.25rem", fontFamily: "'DM Mono', monospace", color: "#666" }}>
                  FROM
                </div>
                <input
                  type="date"
                  className="er-input"
                  value={fromDate}
                  onChange={(e) => setFromDate(e.target.value)}
                />
              </div>
              <div>
                <div style={{ fontSize: "0.7rem", marginBottom: "0.25rem", fontFamily: "'DM Mono', monospace", color: "#666" }}>
                  TO
                </div>
                <input
                  type="date"
                  className="er-input"
                  value={toDate}
                  onChange={(e) => setToDate(e.target.value)}
                />
              </div>
            </div>
            <p className="er-hint">Filter records between these dates (inclusive)</p>
          </div>
        </div>

        <div className="er-actions-bar">
          <button className="er-btn er-btn-black" onClick={loadEmailRecords}>
            <RefreshCw size={16} strokeWidth={2} />
            REFRESH
          </button>
          <button className="er-btn er-btn-green" onClick={downloadExcel}>
            <FileDown size={16} strokeWidth={2} />
            EXPORT TO EXCEL
          </button>
          {(searchTerm || searchTermRomanized || fromDate || toDate) && (
            <button className="er-btn er-btn-outline" onClick={clearAllFilters}>
              <Filter size={16} strokeWidth={2} />
              CLEAR FILTERS
            </button>
          )}
        </div>

        <div className="er-stats-badge">
          <Database size={14} strokeWidth={2} />
          {filteredRecords.length} RECORD{filteredRecords.length !== 1 ? "S" : ""} FOUND
          {isRecentOnlyMode && emailRecords.length > RECENT_LIMIT && (
            <span style={{ marginLeft: "0.5rem", fontSize: "0.65rem", color: "#16a34a" }}>
              (showing {RECENT_LIMIT} most recent)
            </span>
          )}
          {(fromDate || toDate) && (
            <span style={{ marginLeft: "0.5rem", fontSize: "0.65rem" }}>
              {fromDate && toDate && ` | ${fromDate} → ${toDate}`}
              {fromDate && !toDate && ` | from ${fromDate}`}
              {!fromDate && toDate && ` | until ${toDate}`}
            </span>
          )}
        </div>
      </div>

      {/* Table */}
      {filteredRecords.length === 0 ? (
        <div className="er-section er-empty-state">
          <div className="er-empty-icon">
            <Database size={48} strokeWidth={1.5} />
          </div>
          <h3 className="er-empty-title">No Email Records Found</h3>
          <p className="er-empty-text">
            {searchTerm || fromDate || toDate
              ? "Try adjusting your search or filter criteria"
              : "No emails have been composed yet. Start by creating your first email!"}
          </p>
          {(searchTerm || searchTermRomanized || fromDate || toDate) && (
            <button className="er-btn er-btn-black" onClick={clearAllFilters}>
              <Filter size={16} strokeWidth={2} />
              CLEAR FILTERS
            </button>
          )}
        </div>
      ) : (
        <div className="table-container" style={{ width: "100%", overflowX: "auto" }}>
          <div
            ref={topScrollRef}
            onScroll={() => syncScroll("top")}
            style={{
              overflowX: "auto",
              overflowY: "hidden",
              marginBottom: "2px",
              height: "12px",
              background: "var(--gray-100)",
              borderRadius: "var(--radius-md) var(--radius-md) 0 0",
            }}
          >
            <div style={{ height: "1px", width: "2500px" }}></div>
          </div>

          <div
            ref={bottomScrollRef}
            className="table-wrapper"
            onScroll={() => syncScroll("bottom")}
            style={{ overflowX: "auto", width: "100%" }}
          >
            <table className="table" style={{ minWidth: "1400px", width: "100%" }}>
              <thead>
                <tr>
                  <th style={{ cursor: "pointer", minWidth: "100px" }} onClick={() => handleSort("serial_number")}>
                    <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
                      <Database size={16} />
                      Serial No.
                      {getSortIcon("serial_number")}
                    </div>
                  </th>
                  <th style={{ cursor: "pointer", minWidth: "120px" }} onClick={() => handleSort("sent_date")}>
                    <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
                      <Calendar size={16} />
                      Date
                      {getSortIcon("sent_date")}
                    </div>
                  </th>
                  <th style={{ cursor: "pointer", minWidth: "300px" }} onClick={() => handleSort("to_user")}>
                    <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
                      <Mail size={16} />
                      To Email
                      {getSortIcon("to_user")}
                    </div>
                  </th>
                  <th style={{ cursor: "pointer", minWidth: "150px" }} onClick={() => handleSort("place")}>
                    <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
                      <MapPin size={16} />
                      Place
                      {getSortIcon("place")}
                    </div>
                  </th>
                  <th style={{ minWidth: "120px" }}>
                    <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
                      <Mail size={16} />
                      Sent by Post
                    </div>
                  </th>
                  <th style={{ cursor: "pointer", minWidth: "350px" }} onClick={() => handleSort("subject")}>
                    <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
                      <FileText size={16} />
                      Description
                      {getSortIcon("subject")}
                    </div>
                  </th>
                  <th style={{ cursor: "pointer", minWidth: "140px" }} onClick={() => handleSort("stamp_received")}>
                    <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
                      <DollarSign size={16} />
                      Stamp Received
                      {getSortIcon("stamp_received")}
                    </div>
                  </th>
                  <th style={{ cursor: "pointer", minWidth: "140px" }} onClick={() => handleSort("stamp_affixed")}>
                    <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
                      <DollarSign size={16} />
                      Stamp Affixed
                      {getSortIcon("stamp_affixed")}
                    </div>
                  </th>
                  <th style={{ cursor: "pointer", minWidth: "140px" }} onClick={() => handleSort("balance_left")}>
                    <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
                      <DollarSign size={16} />
                      Balance Left
                      {getSortIcon("balance_left")}
                    </div>
                  </th>
                  <th style={{ minWidth: "250px" }}>
                    <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
                      <FileText size={16} />
                      Remarks
                    </div>
                  </th>
                  <th style={{ minWidth: "180px" }}>Actions</th>
                </tr>
              </thead>
              <tbody>
                {filteredRecords.map((record) => (
                  <React.Fragment key={record.id}>
                    <tr>
                      <td>
                        <div
                          style={{
                            display: "inline-flex",
                            alignItems: "center",
                            justifyContent: "center",
                            gap: "6px",
                            padding: "4px 10px",
                            background: "var(--primary-ultralight)",
                            borderRadius: "var(--radius-sm)",
                            fontSize: "0.875rem",
                            fontWeight: "600",
                            color: "var(--primary)",
                          }}
                        >
                          <Database size={14} />
                          {record.serial_number || "-"}
                        </div>
                      </td>
                      <td>
                        <div
                          style={{
                            display: "inline-flex",
                            alignItems: "center",
                            gap: "6px",
                            padding: "4px 10px",
                            background: "var(--gray-100)",
                            borderRadius: "var(--radius-sm)",
                            fontSize: "0.875rem",
                          }}
                        >
                          <Calendar size={14} />
                          {new Date(record.sent_date).toLocaleDateString("en-US", {
                            year: "numeric",
                            month: "short",
                            day: "numeric",
                          })}
                        </div>
                      </td>
                      <td>
                        <div style={{ display: "flex", flexWrap: "wrap", gap: "4px" }}>
                          {record.to_user?.split(",").slice(0, 2).map((email, idx) => (
                            <span
                              key={idx}
                              style={{
                                display: "inline-block",
                                padding: "4px 8px",
                                background: "var(--primary-ultralight)",
                                color: "var(--primary)",
                                borderRadius: "var(--radius-sm)",
                                fontSize: "0.75rem",
                                fontWeight: "500",
                              }}
                            >
                              {email.trim()}
                            </span>
                          ))}
                          {record.to_user?.split(",").length > 2 && (
                            <span
                              style={{
                                display: "inline-block",
                                padding: "4px 8px",
                                background: "var(--gray-200)",
                                color: "var(--text-secondary)",
                                borderRadius: "var(--radius-sm)",
                                fontSize: "0.75rem",
                                fontWeight: "600",
                              }}
                            >
                              +{record.to_user.split(",").length - 2}
                            </span>
                          )}
                        </div>
                      </td>
                      <td>{record.place || "-"}</td>
                      <td>
                        <span
                          className={`badge ${record.postal_sent ? "badge-success" : "badge-secondary"}`}
                          style={{
                            display: "inline-block",
                            padding: "4px 12px",
                            borderRadius: "20px",
                            fontSize: "0.75rem",
                            fontWeight: "500",
                            background: record.postal_sent ? "#16a34a" : "#e5e5e5",
                            color: record.postal_sent ? "#fff" : "#666",
                          }}
                        >
                          {record.postal_sent ? "Yes" : "No"}
                        </span>
                      </td>
                      <td>
                        <div
                          style={{
                            cursor: "pointer",
                            fontWeight: "500",
                            color: "var(--primary)",
                            transition: "color var(--transition-fast)",
                          }}
                          onClick={() => toggleRowExpand(record.id)}
                          onMouseEnter={(e) => (e.currentTarget.style.color = "var(--primary-dark)")}
                          onMouseLeave={(e) => (e.currentTarget.style.color = "var(--primary)")}
                        >
                          {record.subject || "No subject"}
                        </div>
                      </td>
                      <td>₹ {record.stamp_received?.toFixed(2) || "0.00"}</td>
                      <td>₹ {record.stamp_affixed?.toFixed(2) || "0.00"}</td>
                      <td>₹ {record.balance_left?.toFixed(2) || "0.00"}</td>
                      <td>{record.remarks || "-"}</td>
                      <td>
                        <div style={{ display: "flex", gap: "8px", flexWrap: "wrap" }}>
                          <button
                            className="btn btn-sm btn-primary"
                            onClick={() => toggleRowExpand(record.id)}
                            title={expandedRow === record.id ? "Hide details" : "View details"}
                            style={{
                              display: "inline-flex",
                              alignItems: "center",
                              gap: "4px",
                              padding: "4px 8px",
                              background: "#000000",
                              color: "#fff",
                              border: "none",
                              borderRadius: "6px",
                              cursor: "pointer",
                              fontSize: "0.7rem",
                              fontFamily: "monospace",
                            }}
                          >
                            {expandedRow === record.id ? <ChevronUp size={14} /> : <Eye size={14} />}
                          </button>
                          {record.pdf_filename && (
                            <button
                              className="btn btn-sm btn-success"
                              onClick={() => downloadPdf(record.pdf_filename.split(",")[0])}
                              disabled={downloading[record.pdf_filename.split(",")[0]]}
                              style={{
                                display: "inline-flex",
                                alignItems: "center",
                                gap: "4px",
                                padding: "4px 8px",
                                background: "#16a34a",
                                color: "#fff",
                                border: "none",
                                borderRadius: "6px",
                                cursor: "pointer",
                                fontSize: "0.7rem",
                                fontFamily: "monospace",
                              }}
                            >
                              {downloading[record.pdf_filename.split(",")[0]] ? (
                                <div
                                  className="loading-spinner"
                                  style={{
                                    width: "14px",
                                    height: "14px",
                                    border: "2px solid rgba(255,255,255,0.3)",
                                    borderTopColor: "#fff",
                                    borderRadius: "50%",
                                    animation: "spin 0.8s linear infinite",
                                  }}
                                />
                              ) : (
                                <Download size={14} />
                              )}
                            </button>
                          )}
                          <button
                            className="btn btn-sm btn-danger"
                            onClick={() => openDeleteModal(record.id)}
                            disabled={deleting[record.id]}
                            title="Delete record"
                            style={{
                              display: "inline-flex",
                              alignItems: "center",
                              gap: "4px",
                              padding: "4px 8px",
                              background: "#dc2626",
                              color: "#fff",
                              border: "none",
                              borderRadius: "6px",
                              cursor: "pointer",
                              fontSize: "0.7rem",
                              fontFamily: "monospace",
                            }}
                          >
                            {deleting[record.id] ? (
                              <div
                                className="loading-spinner"
                                style={{
                                  width: "14px",
                                  height: "14px",
                                  border: "2px solid rgba(255,255,255,0.3)",
                                  borderTopColor: "#fff",
                                  borderRadius: "50%",
                                  animation: "spin 0.8s linear infinite",
                                }}
                              />
                            ) : (
                              <Trash2 size={14} />
                            )}
                          </button>
                        </div>
                      </td>
                    </tr>
                    {expandedRow === record.id && (
                      <tr>
                        <td colSpan="11" style={{ background: "var(--gray-50)", padding: "var(--space-xl)" }}>
                          <div style={{ display: "grid", gap: "var(--space-lg)" }}>
                            <div>
                              <h4
                                style={{
                                  fontSize: "1rem",
                                  fontWeight: "600",
                                  marginBottom: "var(--space-sm)",
                                  color: "var(--text-primary)",
                                  display: "flex",
                                  alignItems: "center",
                                  gap: "8px",
                                }}
                              >
                                <FileText size={18} />
                                Email Content
                              </h4>
                              <p
                                style={{
                                  color: "var(--text-secondary)",
                                  lineHeight: "1.6",
                                  whiteSpace: "pre-wrap",
                                }}
                              >
                                {record.content || "No content"}
                              </p>
                            </div>
                            {(record.subject_hindi || record.content_hindi) && (
                              <div
                                style={{
                                  padding: "var(--space-lg)",
                                  background: "var(--white)",
                                  borderRadius: "var(--radius-md)",
                                  border: "1px solid var(--border-light)",
                                }}
                              >
                                <h4
                                  style={{
                                    fontSize: "1rem",
                                    fontWeight: "600",
                                    marginBottom: "var(--space-md)",
                                    color: "var(--text-primary)",
                                  }}
                                >
                                  Hindi Translation
                                </h4>
                                {record.subject_hindi && (
                                  <div style={{ marginBottom: "var(--space-sm)" }}>
                                    <strong style={{ color: "var(--text-secondary)" }}>Subject:</strong>
                                    <p style={{ marginTop: "4px", color: "var(--text-secondary)" }}>
                                      {record.subject_hindi}
                                    </p>
                                  </div>
                                )}
                                {record.content_hindi && (
                                  <div>
                                    <strong style={{ color: "var(--text-secondary)" }}>Content:</strong>
                                    <p
                                      style={{
                                        marginTop: "4px",
                                        color: "var(--text-secondary)",
                                        lineHeight: "1.6",
                                        whiteSpace: "pre-wrap",
                                      }}
                                    >
                                      {record.content_hindi}
                                    </p>
                                  </div>
                                )}
                              </div>
                            )}
                            {(record.subject_marathi || record.content_marathi) && (
                              <div
                                style={{
                                  padding: "var(--space-lg)",
                                  background: "var(--white)",
                                  borderRadius: "var(--radius-md)",
                                  border: "1px solid var(--border-light)",
                                }}
                              >
                                <h4
                                  style={{
                                    fontSize: "1rem",
                                    fontWeight: "600",
                                    marginBottom: "var(--space-md)",
                                    color: "var(--text-primary)",
                                  }}
                                >
                                  Marathi Translation
                                </h4>
                                {record.subject_marathi && (
                                  <div style={{ marginBottom: "var(--space-sm)" }}>
                                    <strong style={{ color: "var(--text-secondary)" }}>Subject:</strong>
                                    <p style={{ marginTop: "4px", color: "var(--text-secondary)" }}>
                                      {record.subject_marathi}
                                    </p>
                                  </div>
                                )}
                                {record.content_marathi && (
                                  <div>
                                    <strong style={{ color: "var(--text-secondary)" }}>Content:</strong>
                                    <p
                                      style={{
                                        marginTop: "4px",
                                        color: "var(--text-secondary)",
                                        lineHeight: "1.6",
                                        whiteSpace: "pre-wrap",
                                      }}
                                    >
                                      {record.content_marathi}
                                    </p>
                                  </div>
                                )}
                              </div>
                            )}
                            {record.pdf_filename && (
                              <div>
                                <h4
                                  style={{
                                    fontSize: "1rem",
                                    fontWeight: "600",
                                    marginBottom: "var(--space-sm)",
                                    color: "var(--text-primary)",
                                    display: "flex",
                                    alignItems: "center",
                                    gap: "8px",
                                  }}
                                >
                                  <Paperclip size={18} />
                                  Attachments
                                </h4>
                                <div style={{ display: "flex", flexDirection: "column", gap: "8px" }}>
                                  {record.pdf_filename.split(",").map((filename, idx) => (
                                    <div
                                      key={idx}
                                      style={{
                                        display: "flex",
                                        alignItems: "center",
                                        justifyContent: "space-between",
                                        padding: "var(--space-md)",
                                        background: "var(--white)",
                                        border: "1px solid var(--border-light)",
                                        borderRadius: "var(--radius-md)",
                                      }}
                                    >
                                      <div style={{ display: "flex", alignItems: "center", gap: "12px" }}>
                                        <FileText size={24} style={{ color: "var(--error)" }} />
                                        <span
                                          style={{
                                            fontWeight: "500",
                                            color: "var(--text-primary)",
                                            fontSize: "0.95rem",
                                          }}
                                        >
                                          {filename.trim()}
                                        </span>
                                      </div>
                                      <button
                                        className="btn btn-sm btn-primary"
                                        onClick={() => downloadPdf(filename.trim())}
                                        disabled={downloading[filename.trim()]}
                                        style={{
                                          display: "inline-flex",
                                          alignItems: "center",
                                          gap: "4px",
                                          padding: "4px 12px",
                                          background: "#000000",
                                          color: "#fff",
                                          border: "none",
                                          borderRadius: "6px",
                                          cursor: "pointer",
                                          fontSize: "0.7rem",
                                          fontFamily: "monospace",
                                        }}
                                      >
                                        {downloading[filename.trim()] ? (
                                          <div
                                            className="loading-spinner"
                                            style={{
                                              width: "14px",
                                              height: "14px",
                                              border: "2px solid rgba(255,255,255,0.3)",
                                              borderTopColor: "#fff",
                                              borderRadius: "50%",
                                              animation: "spin 0.8s linear infinite",
                                            }}
                                          />
                                        ) : (
                                          <>
                                            <Download size={14} />
                                            Download
                                          </>
                                        )}
                                      </button>
                                    </div>
                                  ))}
                                </div>
                              </div>
                            )}
                          </div>
                        </td>
                      </tr>
                    )}
                  </React.Fragment>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Delete Modal */}
      {showDeleteModal && (
        <div
          className="er-modal-overlay"
          onClick={(e) => e.target === e.currentTarget && closeDeleteModal()}
        >
          <div className="er-modal">
            <div className="er-modal-header">
              <div className="er-modal-icon">
                <AlertTriangle size={24} strokeWidth={2} />
              </div>
              <h3 className="er-modal-title">Delete Record</h3>
            </div>
            <p className="er-modal-text">
              Are you sure you want to delete this email record? This action cannot be undone.
            </p>
            <div className="er-modal-actions">
              <button className="er-btn er-btn-outline" onClick={closeDeleteModal}>
                Cancel
              </button>
              <button className="er-btn er-btn-red" onClick={confirmDelete}>
                <Trash2 size={16} strokeWidth={2} />
                Delete
              </button>
            </div>
          </div>
        </div>
      )}

      <style>{`
        /* All your existing CSS stays exactly as it was – no changes needed */
        @import url('https://fonts.googleapis.com/css2?family=Playfair+Display:wght@400;500;600;700;800;900&family=DM+Mono:wght@300;400;500&display=swap');

        *,
        *::before,
        *::after {
          box-sizing: border-box;
        }

        .er-root {
          max-width: 1400px;
          margin: 0 auto;
          padding: 2rem 1.5rem;
          font-family: 'Playfair Display', serif;
          background: rgba(245, 245, 245, 0.3);
          backdrop-filter: blur(10px);
          border-radius: 24px;
          color: #000000;
          position: relative;
          z-index: 1;
        }

        /* Header */
        .er-header {
          display: flex;
          align-items: center;
          justify-content: space-between;
          margin-bottom: 2rem;
          padding: 1.5rem 2rem;
          background: #000000;
          border-radius: 12px;
          border: 2px solid #000000;
          color: #fff;
        }
        .er-header-left {
          display: flex;
          align-items: center;
          gap: 1.25rem;
        }
        .er-header-icon {
          width: 48px;
          height: 48px;
          border: 2px solid #ffffff;
          border-radius: 8px;
          display: flex;
          align-items: center;
          justify-content: center;
        }
        .er-title {
          font-family: 'Playfair Display', serif;
          font-size: 1.5rem;
          font-weight: 800;
          margin: 0;
          letter-spacing: 0.08em;
        }
        .er-subtitle {
          margin: 0.2rem 0 0;
          font-size: 0.7rem;
          opacity: 0.55;
          letter-spacing: 0.06em;
          font-family: 'DM Mono', monospace;
        }

        /* Section */
        .er-section {
          background: rgba(255, 255, 255, 0.85);
          backdrop-filter: blur(10px);
          border: 2px solid #000000;
          border-radius: 12px;
          padding: 1.75rem 2rem;
          margin-bottom: 1.25rem;
          position: relative;
          overflow: visible;
          z-index: 1;
        }
        .er-section-label {
          display: flex;
          align-items: center;
          gap: 0.6rem;
          font-size: 0.68rem;
          font-weight: 500;
          letter-spacing: 0.12em;
          color: #000000;
          border-bottom: 2px solid #000000;
          padding-bottom: 0.875rem;
          margin-bottom: 1.5rem;
          font-family: 'DM Mono', monospace;
        }

        /* Filters */
        .er-filters-grid {
          display: grid;
          grid-template-columns: 1fr 1fr;
          gap: 1.5rem;
          margin-bottom: 1.5rem;
        }
        .er-field {
          margin-bottom: 0;
        }
        .er-label-row {
          display: flex;
          justify-content: space-between;
          align-items: center;
          margin-bottom: 0.5rem;
          flex-wrap: wrap;
          gap: 0.5rem;
        }
        .er-label-row .er-label {
          margin-bottom: 0;
        }
        .er-label {
          display: flex;
          align-items: center;
          gap: 0.4rem;
          font-size: 0.65rem;
          font-weight: 500;
          letter-spacing: 0.12em;
          color: #000000;
          font-family: 'DM Mono', monospace;
        }
        .er-input {
          width: 100%;
          padding: 0.75rem 1rem;
          background: #ffffff;
          border: 2px solid #000000;
          border-radius: 8px;
          font-family: 'DM Mono', monospace;
          font-size: 0.875rem;
          color: #000000;
          transition: border-color 0.15s;
        }
        .er-input:focus {
          outline: none;
          border-color: #000000;
        }
        .er-input::placeholder {
          color: #aaa;
          font-size: 0.825rem;
        }
        .er-input-wrap {
          position: relative;
        }
        .er-hint {
          font-size: 0.7rem;
          color: #666;
          margin: 0.5rem 0 0;
          letter-spacing: 0.03em;
          font-family: 'DM Mono', monospace;
        }

        /* Toggle Button for Marathi Mode */
        .er-toggle-btn {
          display: inline-flex;
          align-items: center;
          gap: 0.4rem;
          padding: 0.4rem 0.875rem;
          background: #000000;
          border: 2px solid #000000;
          border-radius: 6px;
          cursor: pointer;
          font-size: 0.7rem;
          font-family: 'DM Mono', monospace;
          color: #ffffff;
          letter-spacing: 0.06em;
          transition: all 0.15s;
        }
        .er-toggle-btn--active {
          background: #000000;
          color: #fff;
          border-color: #000000;
        }

        /* Translating indicator */
        .er-translating {
          display: flex;
          align-items: center;
          gap: 0.3rem;
          font-size: 0.68rem;
          color: #888;
          margin-top: 0.35rem;
          letter-spacing: 0.04em;
          font-family: 'DM Mono', monospace;
        }
        .er-spin {
          animation: er-spin 1s linear infinite;
        }
        @keyframes er-spin {
          from { transform: rotate(0deg); }
          to { transform: rotate(360deg); }
        }

        /* Action Bar */
        .er-actions-bar {
          display: flex;
          gap: 1rem;
          margin-bottom: 1.5rem;
          flex-wrap: wrap;
        }
        .er-stats-badge {
          display: inline-flex;
          align-items: center;
          gap: 0.5rem;
          padding: 0.5rem 1rem;
          background: #ffffff;
          border: 2px solid #000000;
          border-radius: 24px;
          font-size: 0.7rem;
          font-weight: 500;
          font-family: 'DM Mono', monospace;
          letter-spacing: 0.06em;
        }

        /* Buttons */
        .er-btn {
          display: inline-flex;
          align-items: center;
          gap: 0.5rem;
          padding: 0.7rem 1.25rem;
          border-radius: 8px;
          border: 2px solid transparent;
          cursor: pointer;
          font-size: 0.75rem;
          font-family: 'DM Mono', monospace;
          font-weight: 500;
          letter-spacing: 0.06em;
          transition: all 0.15s;
          white-space: nowrap;
        }
        .er-btn:disabled {
          opacity: 0.4;
          cursor: not-allowed;
          transform: none !important;
        }
        .er-btn-green {
          background: #16a34a;
          color: #fff;
          border-color: #16a34a;
        }
        .er-btn-green:hover:not(:disabled) {
          background: #16a34a;
          transform: translateY(-2px);
        }
        .er-btn-red {
          background: #dc2626;
          color: #fff;
          border-color: #dc2626;
        }
        .er-btn-red:hover:not(:disabled) {
          background: #dc2626;
          transform: translateY(-2px);
        }
        .er-btn-black {
          background: #000000;
          color: #fff;
          border-color: #000000;
        }
        .er-btn-black:hover:not(:disabled) {
          background: #333;
          transform: translateY(-1px);
        }
        .er-btn-outline {
          background: transparent;
          border-color: #000000;
          color: #000000;
        }
        .er-btn-outline:hover:not(:disabled) {
          background: #000000;
          color: #fff;
        }

        /* Empty State */
        .er-empty-state {
          text-align: center;
          padding: 3rem;
        }
        .er-empty-icon {
          margin-bottom: 1.5rem;
          color: #666;
        }
        .er-empty-title {
          font-family: 'Playfair Display', serif;
          font-size: 1.5rem;
          font-weight: 600;
          margin-bottom: 0.75rem;
          color: #000000;
        }
        .er-empty-text {
          font-family: 'DM Mono', monospace;
          font-size: 0.875rem;
          color: #666;
          margin-bottom: 1.5rem;
        }

        /* Modal */
        .er-modal-overlay {
          position: fixed;
          inset: 0;
          z-index: 9999;
          display: flex;
          align-items: center;
          justify-content: center;
          padding: 1.5rem;
          background: rgba(255, 255, 255, 0.1);
          backdrop-filter: blur(6px);
          animation: erOverlayIn 0.22s ease both;
        }
        .er-modal {
          width: 100%;
          max-width: 420px;
          background: rgba(255, 255, 255, 0.5);
          backdrop-filter: blur(20px);
          border-radius: 16px;
          box-shadow: 0 32px 80px rgba(0, 0, 0, 0.4);
          padding: 2rem;
          animation: erModalIn 0.35s cubic-bezier(0.16, 1, 0.3, 1) both;
          border: 2px solid #000000;
        }
        .er-modal-header {
          display: flex;
          align-items: center;
          gap: 1rem;
          margin-bottom: 1rem;
        }
        .er-modal-icon {
          width: 48px;
          height: 48px;
          border-radius: 50%;
          background: rgba(239, 68, 68, 0.15);
          display: flex;
          align-items: center;
          justify-content: center;
          flex-shrink: 0;
        }
        .er-modal-title {
          font-family: 'Playfair Display', serif;
          font-size: 1.35rem;
          font-weight: 700;
          color: #000000;
          margin: 0;
        }
        .er-modal-text {
          font-family: 'DM Mono', monospace;
          font-size: 0.95rem;
          font-weight: 500;
          color: #000000;
          line-height: 1.65;
          margin: 1rem 0 1.5rem;
        }
        .er-modal-actions {
          display: flex;
          gap: 0.75rem;
        }
        .er-modal-actions .er-btn {
          flex: 1;
          justify-content: center;
        }

        /* Loading (removed, kept only for potential future use) */
        .er-loading {
          display: flex;
          flex-direction: column;
          align-items: center;
          justify-content: center;
          min-height: 400px;
          gap: 1.5rem;
          background: rgba(255, 255, 255, 0.6);
          backdrop-filter: blur(8px);
          border-radius: 24px;
          margin: 2rem 0;
        }

        @keyframes erOverlayIn {
          from {
            opacity: 0;
          }
          to {
            opacity: 1;
          }
        }
        @keyframes erModalIn {
          from {
            opacity: 0;
            transform: scale(0.92) translateY(20px);
          }
          to {
            opacity: 1;
            transform: scale(1) translateY(0);
          }
        }

        /* Original table styles (restored) */
        .table-container {
          width: 100%;
          overflow-x: auto;
        }
        .table-wrapper {
          overflow-x: auto;
          width: 100%;
        }
        .table {
          min-width: 1400px;
          width: 100%;
          border-collapse: collapse;
          font-family: 'DM Mono', monospace;
          font-size: 0.8rem;
        }
        .table th {
          background: #000000;
          padding: 1rem;
          text-align: left;
          font-weight: 600;
          border-bottom: 2px solid #000000;
          color: #ffffff;
          font-size: 0.7rem;
        }
        .table td {
          padding: 1rem;
          border-bottom: 1px solid #e5e5e5;
          vertical-align: top;
          color: #333;
        }
        .table tr:hover {
          background: rgba(0, 0, 0, 0.02);
        }

        /* Restore the missing CSS variables used in inline styles */
        :root {
          --primary-ultralight: #f0fdf4;
          --primary: #16a34a;
          --primary-dark: #15803d;
          --gray-100: #f5f5f5;
          --gray-200: #e5e5e5;
          --gray-50: #fafafa;
          --text-primary: #000000;
          --text-secondary: #666666;
          --white: #ffffff;
          --border-light: #e5e5e5;
          --space-sm: 0.5rem;
          --space-md: 0.75rem;
          --space-lg: 1rem;
          --space-xl: 1.5rem;
          --space-2xl: 2rem;
          --radius-sm: 6px;
          --radius-md: 8px;
          --transition-fast: 0.15s;
        }

        @keyframes spin {
          from {
            transform: rotate(0deg);
          }
          to {
            transform: rotate(360deg);
          }
        }

        @media (max-width: 768px) {
          .er-root {
            padding: 1rem;
          }
          .er-header {
            flex-direction: column;
            align-items: flex-start;
            gap: 1rem;
          }
          .er-filters-grid {
            grid-template-columns: 1fr;
          }
          .er-actions-bar {
            flex-direction: column;
          }
          .er-btn {
            width: 100%;
            justify-content: center;
          }
          .er-section {
            padding: 1.25rem;
          }
          .er-label-row {
            flex-direction: column;
            align-items: flex-start;
            gap: 0.5rem;
          }
        }
      `}</style>
    </div>
  );
};

export default EmailRecords;
