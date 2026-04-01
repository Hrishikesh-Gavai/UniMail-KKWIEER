import React, { useState, useRef, useEffect } from "react";
import { supabase } from "../services/supabase";
import { showNotification, showPromiseNotification } from "../utils/notifications";
import {
  Mail,
  Send,
  Save,
  Upload,
  FileText,
  ChevronDown,
  ChevronUp,
  Folder,
  X,
  Languages,
  User,
  Calendar,
  Trash2,
  Paperclip,
  CheckSquare,
  Plus,
  Minus,
  MapPin,
  Type,
  Hash,
  RefreshCw,
  Wallet,
  Edit3,
  Truck,
  Banknote,
  MessageSquare,
  HelpCircle,
  File,
  ArrowUpCircle,
  ArrowDownCircle,
  CheckCircle,
  AlertCircle,
} from "lucide-react";

const ComposeEmail = ({ onRecordSaved }) => {
  const [formData, setFormData] = useState({
    from: "",
    to: [],
    subject: "",
    content: "",
    pdfFiles: [],
    pdfFileNames: [],
    subjectHindi: "",
    contentHindi: "",
    subjectMarathi: "",
    contentMarathi: "",
    sentDate: new Date().toISOString().split("T")[0],
  });

  const [postalSent, setPostalSent] = useState(false);
  const [place, setPlace] = useState("");
  const [stampAffixed, setStampAffixed] = useState("");
  const [remarks, setRemarks] = useState("");
  const [serialNumber, setSerialNumber] = useState("");

  const [balance, setBalance] = useState(null);
  const [addFundsAmount, setAddFundsAmount] = useState("");
  const [postalPaymentAmount, setPostalPaymentAmount] = useState("");
  const [processingDeposit, setProcessingDeposit] = useState(false);
  const [processingPayment, setProcessingPayment] = useState(false);

  const [subjectMarathiInput, setSubjectMarathiInput] = useState("");
  const [contentMarathiInput, setContentMarathiInput] = useState("");
  const [isTranslatingSubject, setIsTranslatingSubject] = useState(false);
  const [isTranslatingContent, setIsTranslatingContent] = useState(false);
  const [marathiEnabled, setMarathiEnabled] = useState(false);

  const [dropdownOpen, setDropdownOpen] = useState(false);
  const [fromDropdownOpen, setFromDropdownOpen] = useState(false);
  const [activeFolder, setActiveFolder] = useState(null);
  const [translating, setTranslating] = useState({
    hindi: { subject: false, content: false },
    marathi: { subject: false, content: false },
  });
  const [loading, setLoading] = useState(false);
  const [dragOver, setDragOver] = useState(false);
  const [emailInput, setEmailInput] = useState("");
  const [fromInput, setFromInput] = useState("");
  const [emailOptions, setEmailOptions] = useState({});
  const [fromEmailOptions, setFromEmailOptions] = useState({});
  const [loadingEmails, setLoadingEmails] = useState(true);

  const fileInputRef = useRef(null);
  const toInputRef = useRef(null);
  const fromInputRef = useRef(null);
  const dropdownRef = useRef(null);
  const fromDropdownRef = useRef(null);
  const subjectRef = useRef(null);
  const contentRef = useRef(null);

  useEffect(() => {
    fetchEmailsFromSupabase();
    fetchBalance();
  }, []);

  useEffect(() => {
    const timeoutId = setTimeout(() => {
      if (marathiEnabled && subjectMarathiInput && subjectMarathiInput !== formData.subject) {
        translateRomanizedMarathi(subjectMarathiInput, "subject");
      }
    }, 500);
    return () => clearTimeout(timeoutId);
  }, [subjectMarathiInput]);

  useEffect(() => {
    const timeoutId = setTimeout(() => {
      if (marathiEnabled && contentMarathiInput && contentMarathiInput !== formData.content) {
        translateRomanizedMarathi(contentMarathiInput, "content");
      }
    }, 500);
    return () => clearTimeout(timeoutId);
  }, [contentMarathiInput]);

  const fetchEmailsFromSupabase = async () => {
    setLoadingEmails(true);
    try {
      const [adminRes, principalRes, deansRes, hodRes] = await Promise.all([
        supabase.from("admin").select("email, name, department"),
        supabase.from("principal").select("email, name, department"),
        supabase.from("deans").select("email, name, department"),
        supabase.from("hod").select("email, name, department"),
      ]);
      const toOptions = {};
      if (principalRes?.data?.length > 0)
        toOptions["Principal"] = { "All Principal": principalRes.data.map((p) => p.email) };
      if (deansRes?.data?.length > 0)
        toOptions["Deans"] = { "All Deans": deansRes.data.map((d) => d.email) };
      if (hodRes?.data?.length > 0)
        toOptions["HOD"] = { "All HODs": hodRes.data.map((h) => h.email) };
      setEmailOptions(toOptions);
      if (adminRes?.data?.length > 0)
        setFromEmailOptions({ "Admin Emails": adminRes.data.map((a) => a.email) });
      showNotification("Email contacts loaded successfully", "success");
    } catch (error) {
      showNotification("Failed to load email contacts", "error");
    } finally {
      setLoadingEmails(false);
    }
  };

  const fetchBalance = async () => {
    try {
      const { data, error } = await supabase.from("balance").select("amount").limit(1).single();
      if (error) throw error;
      setBalance(data?.amount || 0);
    } catch (err) {
      showNotification("Failed to load balance", "error");
    }
  };

  const translateRomanizedMarathi = async (text, field) => {
    if (!text.trim()) {
      setFormData((prev) => ({ ...prev, [field === "subject" ? "subject" : "content"]: "" }));
      return;
    }
    field === "subject" ? setIsTranslatingSubject(true) : setIsTranslatingContent(true);
    try {
      const response = await fetch(
        `https://inputtools.google.com/request?text=${encodeURIComponent(text)}&itc=mr-t-i0-und&num=1&cp=0&cs=1&ie=utf-8&oe=utf-8&app=demopage`
      );
      const data = await response.json();
      if (data?.[0] === "SUCCESS" && data[1]?.[0]?.[1]?.length > 0) {
        const translatedText = data[1][0][1][0];
        if (field === "subject") {
          setFormData((prev) => ({ ...prev, subject: translatedText }));
          setSubjectMarathiInput(translatedText);
        } else {
          setFormData((prev) => ({ ...prev, content: translatedText }));
          setContentMarathiInput(translatedText);
        }
      } else {
        setFormData((prev) => ({ ...prev, [field === "subject" ? "subject" : "content"]: text }));
      }
    } catch {
      setFormData((prev) => ({ ...prev, [field === "subject" ? "subject" : "content"]: text }));
    } finally {
      field === "subject" ? setIsTranslatingSubject(false) : setIsTranslatingContent(false);
    }
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubjectInput = (e) => {
    const value = e.target.value;
    marathiEnabled ? setSubjectMarathiInput(value) : setFormData((prev) => ({ ...prev, subject: value }));
  };

  const handleContentInput = (e) => {
    const value = e.target.value;
    marathiEnabled ? setContentMarathiInput(value) : setFormData((prev) => ({ ...prev, content: value }));
  };

  const toggleMarathiMode = () => {
    setMarathiEnabled(!marathiEnabled);
    if (!marathiEnabled) {
      setSubjectMarathiInput(formData.subject);
      setContentMarathiInput(formData.content);
    } else {
      setSubjectMarathiInput("");
      setContentMarathiInput("");
    }
  };

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setDropdownOpen(false);
        setActiveFolder(null);
      }
      if (fromDropdownRef.current && !fromDropdownRef.current.contains(event.target))
        setFromDropdownOpen(false);
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const isValidEmail = (email) => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);

  const addEmail = (email) => {
    if (!formData.to.includes(email)) {
      setFormData((prev) => ({ ...prev, to: [...prev.to, email] }));
      showNotification(`Added ${email}`, "success");
    } else {
      showNotification("Email already added", "warning");
    }
    if (toInputRef.current) toInputRef.current.focus();
  };

  const removeEmail = (email) => {
    setFormData((prev) => ({ ...prev, to: prev.to.filter((e) => e !== email) }));
    showNotification(`Removed ${email}`, "info");
  };

  const clearAllEmails = () => {
    setFormData((prev) => ({ ...prev, to: [] }));
    showNotification("All recipients cleared", "info");
  };

  const setFromEmail = (email) => {
    setFormData((prev) => ({ ...prev, from: email }));
    showNotification(`From email set to ${email}`, "success");
    setFromDropdownOpen(false);
  };

  const clearFromEmail = () => {
    setFormData((prev) => ({ ...prev, from: "" }));
  };

  const selectAllEmails = (categoryKey) => {
    const emailsToAdd = [];
    Object.values(emailOptions[categoryKey]).forEach((emailList) => emailsToAdd.push(...emailList));
    const newEmails = [...new Set(emailsToAdd)].filter((email) => !formData.to.includes(email));
    if (newEmails.length > 0) {
      setFormData((prev) => ({ ...prev, to: [...prev.to, ...newEmails] }));
      showNotification(`Added ${newEmails.length} emails from ${categoryKey}`, "success");
    } else {
      showNotification(`All emails from ${categoryKey} already added`, "info");
    }
  };

  const handleManualEmailInput = (e) => {
    if (e.key === "Enter" || e.key === "," || e.key === "Tab") {
      e.preventDefault();
      const newEmail = emailInput.trim().replace(/[,;\s]+$/, "");
      if (newEmail && isValidEmail(newEmail)) addEmail(newEmail);
      else if (newEmail) showNotification("Please enter a valid email address", "error");
      setEmailInput("");
    }
  };

  const handleManualFromInput = (e) => {
    if (e.key === "Enter" || e.key === "Tab") {
      e.preventDefault();
      const newEmail = fromInput.trim();
      if (newEmail && isValidEmail(newEmail)) {
        setFormData((prev) => ({ ...prev, from: newEmail }));
        showNotification(`From email set to ${newEmail}`, "success");
      } else if (newEmail) showNotification("Please enter a valid email address", "error");
      setFromInput("");
    }
  };

  const handleFileUpload = async (files) => {
    if (!files.length) return;
    const validFiles = Array.from(files).filter((file) => {
      if (file.type !== "application/pdf") {
        showNotification(`${file.name}: Only PDF files are allowed`, "error");
        return false;
      }
      if (file.size > 40 * 1024 * 1024) {
        showNotification(`${file.name}: File size exceeds 40MB limit`, "error");
        return false;
      }
      return true;
    });
    const filesToUpload = [];
    for (const file of validFiles) {
      const fileName = file.name;
      const { data: existingFiles } = await supabase.storage.from("pdfs").list("", { search: fileName });
      if (existingFiles?.length > 0) {
        const baseName = fileName.substring(0, fileName.lastIndexOf("."));
        const extension = fileName.substring(fileName.lastIndexOf("."));
        showNotification(
          `File "${fileName}" exists! Try: ${baseName}_1${extension} or ${baseName}_${Date.now()}${extension}`,
          "warning"
        );
        continue;
      }
      filesToUpload.push(file);
    }
    if (!filesToUpload.length) return;
    showPromiseNotification(
      Promise.all(
        filesToUpload.map(async (file) => {
          const { error } = await supabase.storage.from("pdfs").upload(file.name, file, { upsert: false });
          if (error) throw new Error(`Failed to upload: ${file.name}`);
          setFormData((prev) => ({
            ...prev,
            pdfFiles: [...prev.pdfFiles, file],
            pdfFileNames: [...prev.pdfFileNames, file.name],
          }));
          return file.name;
        })
      ),
      {
        loading: `Uploading ${filesToUpload.length} file(s)...`,
        success: `Successfully uploaded ${filesToUpload.length} file(s)`,
        error: "Some files failed to upload",
      }
    );
  };

  const handleFileInputChange = (e) => {
    handleFileUpload(Array.from(e.target.files));
    e.target.value = "";
  };

  const removeFile = (index) => {
    const fileName = formData.pdfFiles[index].name;
    setFormData((prev) => ({
      ...prev,
      pdfFiles: prev.pdfFiles.filter((_, i) => i !== index),
      pdfFileNames: prev.pdfFileNames.filter((_, i) => i !== index),
    }));
    showNotification(`Removed ${fileName}`, "info");
  };

  const handleDragOver = (e) => { e.preventDefault(); setDragOver(true); };
  const handleDragLeave = (e) => { e.preventDefault(); setDragOver(false); };
  const handleDrop = (e) => { e.preventDefault(); setDragOver(false); handleFileUpload(Array.from(e.dataTransfer.files)); };

  const translateText = async (text, type, language) => {
    if (!text.trim()) { showNotification("Please enter text to translate", "warning"); return; }
    showPromiseNotification(
      new Promise(async (resolve, reject) => {
        setTranslating((prev) => ({ ...prev, [language]: { ...prev[language], [type]: true } }));
        try {
          const langPair = language === "hindi" ? "en|hi" : "en|mr";
          const response = await fetch(
            `https://api.mymemory.translated.net/get?q=${encodeURIComponent(text)}&langpair=${langPair}`
          );
          if (!response.ok) throw new Error("Translation API request failed");
          const data = await response.json();
          if (data.responseStatus !== 200) throw new Error("Translation failed");
          const fieldName = `${type}${language.charAt(0).toUpperCase() + language.slice(1)}`;
          setFormData((prev) => ({ ...prev, [fieldName]: data.responseData.translatedText }));
          resolve(data.responseData.translatedText);
        } catch (error) { reject(error); }
        finally { setTranslating((prev) => ({ ...prev, [language]: { ...prev[language], [type]: false } })); }
      }),
      {
        loading: `Translating to ${language}...`,
        success: `${language.charAt(0).toUpperCase() + language.slice(1)} translation completed`,
        error: "Translation failed. Please try again.",
      }
    );
  };

  const handleAddFunds = async () => {
    const amount = parseFloat(addFundsAmount);
    if (isNaN(amount) || amount <= 0) { showNotification("Please enter a valid positive amount", "error"); return; }
    setProcessingDeposit(true);
    try {
      const { error } = await supabase.rpc("process_transaction", { p_amount: amount, p_type: "deposit", p_description: "Funds added" });
      if (error) throw error;
      await fetchBalance();
      setAddFundsAmount("");
      showNotification(`Successfully added ₹${amount.toFixed(2)}`, "success");
    } catch (err) { showNotification(err.message || "Failed to add funds", "error"); }
    finally { setProcessingDeposit(false); }
  };

  const handlePostalPayment = async () => {
    const amount = parseFloat(postalPaymentAmount);
    if (isNaN(amount) || amount <= 0) { showNotification("Please enter a valid positive amount", "error"); return; }
    if (balance < amount) { showNotification("Insufficient balance for this payment", "error"); return; }
    setProcessingPayment(true);
    try {
      const { error } = await supabase.rpc("process_transaction", { p_amount: -amount, p_type: "withdrawal", p_description: "Postal payment for email" });
      if (error) throw error;
      await fetchBalance();
      setPostalPaymentAmount("");
      showNotification(`Postal payment of ₹${amount.toFixed(2)} deducted`, "success");
    } catch (err) { showNotification(err.message || "Failed to process payment", "error"); }
    finally { setProcessingPayment(false); }
  };

  const saveEmailRecord = async () => {
    if (!formData.to.length) { showNotification("Please add at least one recipient", "error"); return; }
    if (!formData.subject.trim()) { showNotification("Please add a subject", "error"); return; }
    setLoading(true);
    try {
      let stampReceived = 0, balanceLeft = 0;
      const affixedAmount = parseFloat(stampAffixed);
      if (!isNaN(affixedAmount) && affixedAmount > 0) {
        if (balance < affixedAmount) throw new Error("Insufficient balance for this stamp affixed amount");
        const { error: transError } = await supabase.rpc("process_transaction", {
          p_amount: -affixedAmount, p_type: "withdrawal", p_description: `Postal stamp for email: ${formData.subject}`,
        });
        if (transError) throw transError;
        const { data: newBalance, error: balError } = await supabase.from("balance").select("amount").limit(1).single();
        if (balError) throw balError;
        balanceLeft = newBalance?.amount || 0;
        stampReceived = balanceLeft + affixedAmount;
      } else { stampReceived = balance; balanceLeft = balance; }
      const { data, error } = await supabase.from("email_records").insert([{
        from_user: formData.from || "Not specified",
        to_user: formData.to.join(","),
        subject: formData.subject,
        content: formData.content,
        subject_hindi: formData.subjectHindi,
        content_hindi: formData.contentHindi,
        subject_marathi: formData.subjectMarathi,
        content_marathi: formData.contentMarathi,
        pdf_filename: formData.pdfFileNames.length ? formData.pdfFileNames.join(",") : null,
        sent_date: formData.sentDate,
        postal_sent: postalSent,
        place: place || null,
        stamp_received: stampReceived,
        stamp_affixed: isNaN(affixedAmount) ? 0 : affixedAmount,
        balance_left: balanceLeft,
        remarks: remarks || null,
        serial_number: serialNumber || null,
      }]).select();
      if (error) throw error;
      showNotification("Email record saved successfully!", "success");
      setFormData({ from: formData.from, to: [], subject: "", content: "", pdfFiles: [], pdfFileNames: [], subjectHindi: "", contentHindi: "", subjectMarathi: "", contentMarathi: "", sentDate: new Date().toISOString().split("T")[0] });
      setPostalSent(false); setPlace(""); setStampAffixed(""); setRemarks(""); setSerialNumber(""); setEmailInput(""); setSubjectMarathiInput(""); setContentMarathiInput(""); setMarathiEnabled(false);
      if (onRecordSaved) onRecordSaved(data[0]);
    } catch (err) { showNotification(err.message || "Failed to save email record", "error"); }
    finally { setLoading(false); }
  };

  const openGmailAndSave = async () => {
    if (!formData.to.length) { showNotification("Please add at least one recipient", "error"); return; }
    if (!formData.subject.trim()) { showNotification("Please add a subject", "error"); return; }
    showPromiseNotification(
      new Promise(async (resolve, reject) => {
        try {
          const toEmails = formData.to.join(",");
          let body = formData.content || "";
          if (formData.pdfFileNames.length > 0) {
            body += "\n\n--- Attachments ---\n";
            for (let i = 0; i < formData.pdfFileNames.length; i++) {
              const { data } = supabase.storage.from("pdfs").getPublicUrl(formData.pdfFileNames[i]);
              if (data?.publicUrl) body += `${formData.pdfFiles[i].name}\n${data.publicUrl}\n\n`;
            }
          }
          if (formData.subjectHindi || formData.contentHindi || formData.subjectMarathi || formData.contentMarathi) {
            body += "\n--- Translations ---\n";
            if (formData.subjectHindi || formData.contentHindi) {
              body += "\nHindi:\n";
              if (formData.subjectHindi) body += `Subject: ${formData.subjectHindi}\n`;
              if (formData.contentHindi) body += `Content: ${formData.contentHindi}\n`;
            }
            if (formData.subjectMarathi || formData.contentMarathi) {
              body += "\nMarathi:\n";
              if (formData.subjectMarathi) body += `Subject: ${formData.subjectMarathi}\n`;
              if (formData.contentMarathi) body += `Content: ${formData.contentMarathi}\n`;
            }
          }
          const gmailUrl = `https://mail.google.com/mail/?view=cm&fs=1&to=${encodeURIComponent(toEmails)}&su=${encodeURIComponent(formData.subject)}&body=${encodeURIComponent(body)}`;
          const gmailWindow = window.open(gmailUrl, "_blank");
          if (gmailWindow) { setTimeout(async () => { await saveEmailRecord(); resolve(); }, 1000); }
          else throw new Error("Please allow popups for Gmail to open");
        } catch (error) { reject(error); }
      }),
      { loading: "Opening Gmail and saving record...", success: "Gmail opened! Record saved.", error: "Failed to open Gmail. Check popup settings." }
    );
  };

  const clearForm = () => {
    setFormData({ from: formData.from, to: [], subject: "", content: "", pdfFiles: [], pdfFileNames: [], subjectHindi: "", contentHindi: "", subjectMarathi: "", contentMarathi: "", sentDate: new Date().toISOString().split("T")[0] });
    setPostalSent(false); setPlace(""); setStampAffixed(""); setRemarks(""); setSerialNumber(""); setEmailInput(""); setSubjectMarathiInput(""); setContentMarathiInput(""); setMarathiEnabled(false);
    showNotification("Form cleared", "info");
  };

  if (loadingEmails) {
    return (
      <div style={{ display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", minHeight: "300px", gap: "1rem" }}>
        <div className="ce-spinner" />
        <p style={{ color: "#000000", fontFamily: "'Playfair Display', serif", fontSize: "0.875rem", letterSpacing: "0.05em" }}>LOADING CONTACTS...</p>
      </div>
    );
  }

  return (
    <div className="ce-root">
      <link href="https://fonts.googleapis.com/css2?family=Playfair+Display:wght@400;500;600;700;800;900&family=DM+Mono:wght@300;400;500&display=swap" rel="stylesheet" />

      {/* ── Header ── */}
      <div className="ce-header">
        <div className="ce-header-left">
          <div className="ce-header-icon"><Mail size={22} strokeWidth={1.5} /></div>
          <div>
            <h1 className="ce-title">COMPOSE EMAIL</h1>
            <p className="ce-subtitle">Multi-language · Postal Tracking · Balance Management</p>
          </div>
        </div>
      </div>

      {/* ── Balance Management ── */}
      <section className="ce-section">
        <div className="ce-section-label">
          <Wallet size={15} strokeWidth={2} />
          <span>BALANCE MANAGEMENT</span>
        </div>

        <div className="ce-balance-grid">
          {/* Current Balance */}
          <div className="ce-balance-card">
            <div className="ce-balance-card-top">
              <span className="ce-balance-card-label">CURRENT BALANCE</span>
              <Wallet size={18} strokeWidth={1.5} className="ce-balance-card-icon" />
            </div>
            <div className="ce-balance-amount">
              ₹ {balance !== null ? balance.toFixed(2) : "—"}
            </div>
            <div className="ce-balance-card-sub">Available for postal services</div>
          </div>

          {/* Add Funds */}
          <div className="ce-txn-card">
            <div className="ce-txn-label">
              <ArrowUpCircle size={16} strokeWidth={2} className="ce-icon-green" />
              <span>ADD FUNDS</span>
            </div>
            <div className="ce-txn-row">
              <div className="ce-input-prefix-wrap">
                <span className="ce-input-prefix">₹</span>
                <input
                  type="number"
                  className="ce-input ce-input-prefix-pad"
                  placeholder="0.00"
                  value={addFundsAmount}
                  onChange={(e) => setAddFundsAmount(e.target.value)}
                  step="0.01"
                  min="0"
                />
              </div>
              <button className="ce-btn ce-btn-green" onClick={handleAddFunds} disabled={processingDeposit}>
                {processingDeposit ? <div className="ce-spinner-sm" /> : <><ArrowUpCircle size={16} strokeWidth={2} /><span>DEPOSIT</span></>}
              </button>
            </div>
            <p className="ce-hint">Deposit money to your account</p>
          </div>

          {/* Postal Payment */}
          <div className="ce-txn-card">
            <div className="ce-txn-label">
              <ArrowDownCircle size={16} strokeWidth={2} className="ce-icon-red" />
              <span>POSTAL PAYMENT</span>
            </div>
            <div className="ce-txn-row">
              <div className="ce-input-prefix-wrap">
                <span className="ce-input-prefix">₹</span>
                <input
                  type="number"
                  className="ce-input ce-input-prefix-pad"
                  placeholder="0.00"
                  value={postalPaymentAmount}
                  onChange={(e) => setPostalPaymentAmount(e.target.value)}
                  step="0.01"
                  min="0"
                />
              </div>
              <button className="ce-btn ce-btn-red" onClick={handlePostalPayment} disabled={processingPayment}>
                {processingPayment ? <div className="ce-spinner-sm ce-spinner-dark" /> : <><ArrowDownCircle size={16} strokeWidth={2} /><span>DEDUCT</span></>}
              </button>
            </div>
            {balance !== null && postalPaymentAmount && parseFloat(postalPaymentAmount) > balance && (
              <p className="ce-error-hint">
                <AlertCircle size={12} strokeWidth={2} />
                Insufficient balance — ₹{balance.toFixed(2)} available
              </p>
            )}
            <p className="ce-hint">Deduct amount for postal services</p>
          </div>
        </div>
      </section>

      {/* ── Sender ── */}
      <section className="ce-section ce-section-sender">
        <div className="ce-section-label">
          <User size={15} strokeWidth={2} />
          <span>SENDER INFORMATION</span>
        </div>
        <div className="ce-field">
          <label className="ce-label">FROM EMAIL ADDRESS</label>
          <div className="ce-tag-box" ref={fromDropdownRef}>
            <div className="ce-tags-wrap">
              {formData.from && (
                <span className="ce-tag">
                  {formData.from}
                  <button className="ce-tag-remove" onClick={clearFromEmail}><X size={11} strokeWidth={3} /></button>
                </span>
              )}
              <input
                ref={fromInputRef}
                type="email"
                className="ce-tag-input"
                placeholder={!formData.from ? "Type email and press Enter…" : "Change sender…"}
                value={fromInput}
                onChange={(e) => setFromInput(e.target.value)}
                onKeyDown={handleManualFromInput}
              />
              <button className="ce-dropdown-btn ce-dropdown-btn-black" onClick={() => setFromDropdownOpen((p) => !p)}>
                <ChevronDown size={14} strokeWidth={2} />
                <span>Quick Select</span>
              </button>
            </div>
            {fromDropdownOpen && (
              <div className="ce-dropdown ce-dropdown-top">
                {Object.entries(fromEmailOptions).map(([cat, emails]) => (
                  <div key={cat}>
                    <div className="ce-dropdown-cat">{cat}</div>
                    {emails.map((email) => (
                      <div key={email} className={`ce-dropdown-item ${formData.from === email ? "ce-dropdown-item--active" : ""}`} onClick={() => setFromEmail(email)}>
                        {email}
                        {formData.from === email && <CheckCircle size={13} strokeWidth={2.5} className="ce-icon-green" />}
                      </div>
                    ))}
                  </div>
                ))}
              </div>
            )}
          </div>
          <p className="ce-hint">Press Enter or Tab to confirm a manually typed address</p>
        </div>
      </section>

      {/* ── Recipients ── */}
      <section className="ce-section ce-section-recipients">
        <div className="ce-section-label">
          <Mail size={15} strokeWidth={2} />
          <span>RECIPIENTS</span>
        </div>
        <div className="ce-field">
          <label className="ce-label ce-label--required">TO EMAIL ADDRESSES</label>
          <div className="ce-tag-box" ref={dropdownRef}>
            <div className="ce-tags-wrap">
              {formData.to.map((email, i) => (
                <span key={i} className="ce-tag">
                  {email}
                  <button className="ce-tag-remove" onClick={() => removeEmail(email)}><X size={11} strokeWidth={3} /></button>
                </span>
              ))}
              <input
                ref={toInputRef}
                type="email"
                className="ce-tag-input"
                placeholder={formData.to.length === 0 ? "Type email and press Enter…" : "Add more…"}
                value={emailInput}
                onChange={(e) => setEmailInput(e.target.value)}
                onKeyDown={handleManualEmailInput}
              />
              <button className="ce-dropdown-btn ce-dropdown-btn-black" onClick={() => { setDropdownOpen((p) => !p); setActiveFolder(null); }}>
                <ChevronDown size={14} strokeWidth={2} />
                <span>Quick Select</span>
              </button>
            </div>
            {formData.to.length > 0 && (
              <button className="ce-clear-btn" onClick={clearAllEmails}>
                <Trash2 size={13} strokeWidth={2} />
                Clear All ({formData.to.length})
              </button>
            )}
            {dropdownOpen && (
              <div className="ce-dropdown ce-dropdown-top">
                {Object.entries(emailOptions).map(([cat, subcategories]) => (
                  <div key={cat}>
                    <div className="ce-dropdown-cat ce-dropdown-cat--folder" onClick={() => setActiveFolder(activeFolder === cat ? null : cat)}>
                      <Folder size={13} strokeWidth={2} />
                      <span>{cat}</span>
                      {activeFolder === cat ? <ChevronUp size={13} strokeWidth={2} /> : <ChevronDown size={13} strokeWidth={2} />}
                    </div>
                    {activeFolder === cat && (
                      <div className="ce-dropdown-sub">
                        <button className="ce-select-all-btn" onClick={() => selectAllEmails(cat)}>
                          <CheckSquare size={12} strokeWidth={2} />
                          Select All {cat}
                        </button>
                        {Object.entries(subcategories).map(([subcat, emails]) => (
                          <div key={subcat}>
                            <div className="ce-dropdown-subcat">{subcat}</div>
                            {emails.map((email) => (
                              <div key={email} className={`ce-dropdown-item ${formData.to.includes(email) ? "ce-dropdown-item--active" : ""}`} onClick={() => addEmail(email)}>
                                {email}
                                {formData.to.includes(email) && <CheckCircle size={13} strokeWidth={2.5} className="ce-icon-green" />}
                              </div>
                            ))}
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                ))}
              </div>
            )}
          </div>
          <p className="ce-hint">Press Enter, comma, or Tab to add each email address</p>
        </div>
      </section>

      {/* ── Subject ── */}
      <section className="ce-section">
        <div className="ce-section-label">
          <FileText size={15} strokeWidth={2} />
          <span>SUBJECT LINE</span>
        </div>
        <div className="ce-field">
          <div className="ce-label-row">
            <label className="ce-label ce-label--required">SUBJECT</label>
            <button className={`ce-toggle-btn ${marathiEnabled ? "ce-toggle-btn--active" : ""}`} onClick={toggleMarathiMode}>
              <Type size={13} strokeWidth={2} />
              {marathiEnabled ? "मराठी MODE ON" : "MARATHI MODE"}
            </button>
          </div>
          <div className="ce-input-wrap">
            <input
              ref={subjectRef}
              type="text"
              className="ce-input"
              placeholder={marathiEnabled ? "Type in Romanized Marathi (e.g., Ata kiti vajle)…" : "Enter email subject…"}
              value={marathiEnabled ? subjectMarathiInput : formData.subject}
              onChange={handleSubjectInput}
            />
            {isTranslatingSubject && (
              <span className="ce-translating">
                <RefreshCw size={11} strokeWidth={2} className="ce-spin" />
                Transliterating…
              </span>
            )}
          </div>
          <p className="ce-hint">{marathiEnabled ? "Auto-converts Romanized text to Marathi script" : "Enter a clear, concise subject line"}</p>
        </div>
      </section>

      {/* ── Content ── */}
      <section className="ce-section">
        <div className="ce-section-label">
          <Edit3 size={15} strokeWidth={2} />
          <span>EMAIL CONTENT</span>
        </div>
        <div className="ce-field">
          <label className="ce-label">MESSAGE</label>
          <div className="ce-input-wrap">
            <textarea
              className="ce-textarea"
              placeholder={marathiEnabled ? "Type in Romanized Marathi (e.g., Aaj cha program kay ahe?)…" : "Write your email content here…"}
              value={marathiEnabled ? contentMarathiInput : formData.content}
              onChange={handleContentInput}
              rows={8}
              name={!marathiEnabled ? "content" : undefined}
            />
            {isTranslatingContent && (
              <span className="ce-translating">
                <RefreshCw size={11} strokeWidth={2} className="ce-spin" />
                Transliterating…
              </span>
            )}
          </div>
          <p className="ce-hint">Supports plain text. Enable Marathi Mode above to type in Devanagari.</p>
        </div>
      </section>

      {/* ── Translations ── */}
      <section className="ce-section">
        <div className="ce-section-label">
          <Languages size={15} strokeWidth={2} />
          <span>MULTI-LANGUAGE TRANSLATION</span>
        </div>
        <div className="ce-translation-grid">
          {/* Hindi */}
          <div className="ce-lang-card">
            <div className="ce-lang-header">
              <span className="ce-lang-badge ce-lang-badge--hi">हिंदी HINDI</span>
              <div className="ce-lang-actions">
                <button className="ce-action-btn ce-action-btn-black" onClick={() => translateText(formData.subject, "subject", "hindi")} disabled={translating.hindi.subject || !formData.subject.trim()}>
                  <Languages size={12} strokeWidth={2} /> Subject
                </button>
                <button className="ce-action-btn ce-action-btn-black" onClick={() => translateText(formData.content, "content", "hindi")} disabled={translating.hindi.content || !formData.content.trim()}>
                  <Languages size={12} strokeWidth={2} /> Content
                </button>
              </div>
            </div>
            <input type="text" name="subjectHindi" className="ce-input" placeholder="Hindi subject appears here…" value={formData.subjectHindi} onChange={handleInputChange} />
            <textarea name="contentHindi" className="ce-textarea" style={{ marginTop: "0.75rem" }} placeholder="Hindi content appears here…" value={formData.contentHindi} onChange={handleInputChange} rows={4} />
          </div>
          {/* Marathi */}
          <div className="ce-lang-card">
            <div className="ce-lang-header">
              <span className="ce-lang-badge ce-lang-badge--mr">मराठी MARATHI</span>
              <div className="ce-lang-actions">
                <button className="ce-action-btn ce-action-btn-black" onClick={() => translateText(formData.subject, "subject", "marathi")} disabled={translating.marathi.subject || !formData.subject.trim()}>
                  <Languages size={12} strokeWidth={2} /> Subject
                </button>
                <button className="ce-action-btn ce-action-btn-black" onClick={() => translateText(formData.content, "content", "marathi")} disabled={translating.marathi.content || !formData.content.trim()}>
                  <Languages size={12} strokeWidth={2} /> Content
                </button>
              </div>
            </div>
            <input type="text" name="subjectMarathi" className="ce-input" placeholder="Marathi subject appears here…" value={formData.subjectMarathi} onChange={handleInputChange} />
            <textarea name="contentMarathi" className="ce-textarea" style={{ marginTop: "0.75rem" }} placeholder="Marathi content appears here…" value={formData.contentMarathi} onChange={handleInputChange} rows={4} />
          </div>
        </div>
        <p className="ce-hint">Click the buttons to auto-translate subject or content to each language</p>
      </section>

      {/* ── Reference ── */}
      <section className="ce-section">
        <div className="ce-section-label">
          <Hash size={15} strokeWidth={2} />
          <span>REFERENCE INFORMATION</span>
        </div>
        <div className="ce-field">
          <label className="ce-label">SERIAL NUMBER</label>
          <input type="text" className="ce-input" placeholder="e.g., INV-001, PO-2024-123, REF-001" value={serialNumber} onChange={(e) => setSerialNumber(e.target.value)} />
          <p className="ce-hint">Optional reference number for tracking and identification</p>
        </div>
      </section>

      {/* ── Attachments ── */}
      <section className="ce-section">
        <div className="ce-section-label">
          <Paperclip size={15} strokeWidth={2} />
          <span>ATTACHMENTS</span>
        </div>
        <div
          className={`ce-upload-area ${dragOver ? "ce-upload-area--active" : ""}`}
          onDragOver={handleDragOver}
          onDragLeave={handleDragLeave}
          onDrop={handleDrop}
          onClick={() => fileInputRef.current.click()}
        >
          <Upload size={28} strokeWidth={1.5} />
          <p className="ce-upload-text">{dragOver ? "Drop PDF files here" : "Drag & drop PDF files, or click to browse"}</p>
          <p className="ce-upload-sub">Max 40 MB per file · PDF only</p>
        </div>
        <input ref={fileInputRef} type="file" accept="application/pdf" multiple onChange={handleFileInputChange} style={{ display: "none" }} />
        {formData.pdfFiles.length > 0 && (
          <div className="ce-file-list">
            <div className="ce-file-list-header">
              <span>FILE NAME</span>
              <span>SIZE</span>
            </div>
            {formData.pdfFiles.map((file, i) => (
              <div key={i} className="ce-file-row">
                <div className="ce-file-info">
                  <File size={16} strokeWidth={1.5} />
                  <div>
                    <p className="ce-file-name">{file.name}</p>
                    <p className="ce-file-size">{(file.size / 1024 / 1024).toFixed(2)} MB</p>
                  </div>
                </div>
                <button className="ce-file-remove" onClick={() => removeFile(i)}>
                  <Trash2 size={14} strokeWidth={2} />
                </button>
              </div>
            ))}
          </div>
        )}
      </section>

      {/* ── Postal Details ── */}
      <section className="ce-section">
        <div className="ce-section-label">
          <Truck size={15} strokeWidth={2} />
          <span>POSTAL DETAILS</span>
        </div>
        <div className="ce-postal-grid">
          <div className="ce-field">
            <label className="ce-label">
              <MapPin size={13} strokeWidth={2} style={{ display: "inline", marginRight: "0.4rem" }} />
              PLACE (CITY)
            </label>
            <input type="text" className="ce-input" placeholder="e.g., Nashik, Mumbai, Pune" value={place} onChange={(e) => setPlace(e.target.value)} />
            <p className="ce-hint">City where the postal mail was sent from</p>
          </div>
          <div className="ce-field">
            <label className="ce-label">
              <Banknote size={13} strokeWidth={2} style={{ display: "inline", marginRight: "0.4rem" }} />
              STAMP AFFIXED (₹)
            </label>
            <div className="ce-input-prefix-wrap">
              <span className="ce-input-prefix">₹</span>
              <input type="number" className="ce-input ce-input-prefix-pad" placeholder="0.00" value={stampAffixed} onChange={(e) => setStampAffixed(e.target.value)} step="0.01" min="0" />
            </div>
            {balance !== null && stampAffixed && parseFloat(stampAffixed) > balance && (
              <p className="ce-error-hint"><AlertCircle size={12} strokeWidth={2} /> Exceeds balance: ₹{balance.toFixed(2)}</p>
            )}
            <p className="ce-hint">Amount spent on postage stamps</p>
          </div>
          <div className="ce-field ce-field--full">
            <label className="ce-label">
              <MessageSquare size={13} strokeWidth={2} style={{ display: "inline", marginRight: "0.4rem" }} />
              REMARKS
            </label>
            <textarea className="ce-textarea" placeholder="Additional remarks about postal delivery, special instructions, or notes…" value={remarks} onChange={(e) => setRemarks(e.target.value)} rows={3} />
            <p className="ce-hint">Any notes or special instructions for postal sending</p>
          </div>
        </div>
      </section>

      {/* ── Date & Postal Toggle ── */}
      <section className="ce-section">
        <div className="ce-section-label">
          <Calendar size={15} strokeWidth={2} />
          <span>DATE & DISPATCH</span>
        </div>
        <div className="ce-date-grid">
          <div className="ce-field">
            <label className="ce-label">SENT DATE</label>
            <input type="date" name="sentDate" className="ce-input" value={formData.sentDate} onChange={handleInputChange} />
            <p className="ce-hint">Date when the email was sent</p>
          </div>
          <div className="ce-field">
            <label className="ce-label">SENT VIA POSTAL</label>
            <div className="ce-toggle-group">
              <button className={`ce-toggle ${!postalSent ? "ce-toggle--active" : ""}`} onClick={() => setPostalSent(false)}>NO</button>
              <button className={`ce-toggle ${postalSent ? "ce-toggle--active" : ""}`} onClick={() => setPostalSent(true)}>YES</button>
            </div>
            <p className="ce-hint">Mark if also dispatched through postal service</p>
          </div>
        </div>
      </section>

      {/* ── Actions ── */}
      <div className="ce-actions">
        <button className="ce-btn ce-btn-green ce-btn--lg" onClick={openGmailAndSave} disabled={loading || !formData.to.length || !formData.subject.trim()}>
          {loading ? <div className="ce-spinner-sm" /> : <Send size={18} strokeWidth={2} />}
          OPEN IN GMAIL & SAVE
        </button>
        <button className="ce-btn ce-btn-black ce-btn--lg" onClick={saveEmailRecord} disabled={loading || !formData.to.length || !formData.subject.trim()}>
          {loading ? <div className="ce-spinner-sm" /> : <Save size={18} strokeWidth={2} />}
          SAVE RECORD ONLY
        </button>
        <button className="ce-btn ce-btn-red ce-btn--lg" onClick={clearForm} disabled={loading}>
          <Trash2 size={18} strokeWidth={2} />
          CLEAR FORM
        </button>
      </div>

      {/* ── Tips ── */}
      <div className="ce-tips">
        <div className="ce-tips-icon"><HelpCircle size={18} strokeWidth={1.5} /></div>
        <div>
          <p className="ce-tips-title">QUICK TIPS</p>
          <ul className="ce-tips-list">
            <li><strong>Email Addresses:</strong> Press Enter, comma, or Tab after each address. Use Quick Select for predefined contacts.</li>
            <li><strong>Marathi Mode:</strong> Enables Romanized-to-Devanagari auto-conversion as you type.</li>
            <li><strong>Translations:</strong> Click the language buttons to auto-translate subject and content.</li>
            <li><strong>Attachments:</strong> Drag & drop or click to attach PDFs up to 40 MB each.</li>
            <li><strong>Balance:</strong> Use the Deposit ↑ button to add funds and Deduct ↓ for postal payments.</li>
          </ul>
        </div>
      </div>

      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Playfair+Display:wght@400;500;600;700;800;900&family=DM+Mono:wght@300;400;500&display=swap');

        *, *::before, *::after { box-sizing: border-box; }

        .ce-root {
          max-width: 1160px;
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

        /* ── Header ── */
        .ce-header {
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
        .ce-header-left { display: flex; align-items: center; gap: 1.25rem; }
        .ce-header-icon {
          width: 48px; height: 48px;
          border: 2px solid #ffffff;
          border-radius: 8px;
          display: flex; align-items: center; justify-content: center;
        }
        .ce-title {
          font-family: 'Playfair Display', serif;
          font-size: 1.5rem;
          font-weight: 800;
          margin: 0;
          letter-spacing: 0.08em;
        }
        .ce-subtitle {
          margin: 0.2rem 0 0;
          font-size: 0.7rem;
          opacity: 0.55;
          letter-spacing: 0.06em;
          font-family: 'DM Mono', monospace;
        }

        /* ── Section ── */
        .ce-section {
          background: rgba(255, 255, 255, 0.85);
          backdrop-filter: blur(10px);
          border: 2px solid #000000;
          border-radius: 12px;
          padding: 1.75rem 2rem;
          margin-bottom: 1.25rem;
          position: relative;
          overflow: visible !important;
          z-index: 1;
        }
        .ce-section-sender {
          position: relative;
          z-index: 20;
        }
        .ce-section-recipients {
          position: relative;
          z-index: 10;
        }
        .ce-section-label {
          display: flex; align-items: center; gap: 0.6rem;
          font-size: 0.68rem;
          font-weight: 500;
          letter-spacing: 0.12em;
          color: #000000;
          border-bottom: 2px solid #000000;
          padding-bottom: 0.875rem;
          margin-bottom: 1.5rem;
          font-family: 'DM Mono', monospace;
        }

        /* ── Balance ── */
        .ce-balance-grid {
          display: grid;
          grid-template-columns: 1fr 1fr 1fr;
          gap: 1.25rem;
        }
        .ce-balance-card {
          background: #000000;
          border: 2px solid #000000;
          border-radius: 10px;
          padding: 1.5rem;
          color: #fff;
        }
        .ce-balance-card-top { display: flex; justify-content: space-between; align-items: center; margin-bottom: 1rem; }
        .ce-balance-card-label { font-size: 0.65rem; letter-spacing: 0.12em; opacity: 0.6; font-family: 'DM Mono', monospace; }
        .ce-balance-card-icon { opacity: 0.4; }
        .ce-balance-amount { font-family: 'Playfair Display', serif; font-size: 2rem; font-weight: 700; margin-bottom: 0.4rem; }
        .ce-balance-card-sub { font-size: 0.65rem; opacity: 0.5; letter-spacing: 0.06em; font-family: 'DM Mono', monospace; }
        .ce-txn-card {
          background: #ffffff;
          border: 2px solid #000000;
          border-radius: 10px;
          padding: 1.25rem 1.5rem;
        }
        .ce-txn-label {
          display: flex; align-items: center; gap: 0.5rem;
          font-size: 0.68rem; letter-spacing: 0.1em; font-weight: 500;
          color: #000000; margin-bottom: 0.875rem;
          font-family: 'DM Mono', monospace;
        }
        .ce-txn-row { display: flex; gap: 0.625rem; margin-bottom: 0.5rem; }
        .ce-txn-row .ce-input-prefix-wrap { flex: 1; }

        /* ── Form inputs ── */
        .ce-field { margin-bottom: 0; }
        .ce-field + .ce-field { margin-top: 1.25rem; }
        .ce-field--full { grid-column: 1 / -1; }

        .ce-label {
          display: block;
          font-size: 0.65rem;
          font-weight: 500;
          letter-spacing: 0.12em;
          color: #000000;
          margin-bottom: 0.5rem;
          font-family: 'DM Mono', monospace;
        }
        .ce-label--required::after { content: " *"; color: #000000; }
        .ce-label-row { display: flex; justify-content: space-between; align-items: center; margin-bottom: 0.5rem; }
        .ce-label-row .ce-label { margin-bottom: 0; }

        .ce-input, .ce-textarea {
          width: 100%;
          padding: 0.75rem 1rem;
          background: #ffffff;
          border: 2px solid #000000;
          border-radius: 8px;
          font-family: 'DM Mono', monospace;
          font-size: 0.875rem;
          color: #000000;
          transition: border-color 0.15s;
          line-height: 1.5;
        }
        .ce-input:focus, .ce-textarea:focus {
          outline: none;
          border-color: #000000;
        }
        .ce-input::placeholder, .ce-textarea::placeholder { color: #aaa; font-size: 0.825rem; }
        .ce-textarea { resize: vertical; min-height: 80px; }
        .ce-input-wrap { position: relative; }
        .ce-input-prefix-wrap { position: relative; }
        .ce-input-prefix {
          position: absolute; left: 0.875rem; top: 50%; transform: translateY(-50%);
          font-size: 0.875rem; color: #777; pointer-events: none; font-family: 'DM Mono', monospace;
        }
        .ce-input-prefix-pad { padding-left: 2rem; }

        .ce-hint { font-size: 0.7rem; color: #666; margin: 0.5rem 0 0; letter-spacing: 0.03em; font-family: 'DM Mono', monospace; line-height: 1.4; }
        .ce-error-hint {
          display: flex; align-items: center; gap: 0.35rem;
          font-size: 0.7rem; color: #dc2626; margin: 0.5rem 0 0;
          font-family: 'DM Mono', monospace;
        }

        /* ── Tag box (email inputs) ── */
        .ce-tag-box {
          position: relative;
          z-index: 10;
        }
        .ce-tags-wrap {
          display: flex; flex-wrap: wrap; gap: 0.5rem; align-items: center;
          padding: 0.5rem 0.625rem;
          border: 2px solid #000000;
          border-radius: 8px;
          background: #ffffff;
          min-height: 46px;
          transition: border-color 0.15s;
        }
        .ce-tags-wrap:focus-within { border-color: #000000; }
        .ce-tag {
          display: inline-flex; align-items: center; gap: 0.45rem;
          padding: 0.25rem 0.625rem;
          background: #000000; color: #fff;
          border-radius: 20px; font-size: 0.78rem;
          font-family: 'DM Mono', monospace;
          border: 1px solid #000000;
        }
        .ce-tag-remove {
          background: rgba(255,255,255,0.15); border: none; color: #fff;
          cursor: pointer; width: 16px; height: 16px; border-radius: 50%;
          display: inline-flex; align-items: center; justify-content: center;
          padding: 0; transition: background 0.15s;
        }
        .ce-tag-remove:hover { background: rgba(255,255,255,0.3); }
        .ce-tag-input {
          flex: 1; min-width: 160px; border: none; padding: 0.35rem 0.25rem;
          outline: none; font-size: 0.875rem; font-family: 'DM Mono', monospace; color: #000000; background: transparent;
        }
        .ce-tag-input::placeholder { color: #aaa; }
        .ce-dropdown-btn {
          display: inline-flex; align-items: center; gap: 0.4rem;
          padding: 0.35rem 0.75rem;
          background: #ffffff; border: 2px solid #000000;
          border-radius: 6px; cursor: pointer;
          font-size: 0.72rem; font-family: 'DM Mono', monospace;
          color: #000000; letter-spacing: 0.04em;
          transition: background 0.15s;
        }
        .ce-dropdown-btn-black {
          background: #000000;
          color: #ffffff;
          border-color: #000000;
        }
        .ce-dropdown-btn-black:hover {
          background: #000000 !important;
          color: #ffffff !important;
          border-color: #000000 !important;
          transform: translateY(-1px);
        }
        .ce-dropdown-btn:hover { background: #f0f0f0; }
        .ce-clear-btn {
          display: inline-flex; align-items: center; gap: 0.4rem;
          margin-top: 0.5rem;
          padding: 0.35rem 0.75rem;
          background: #fee2e2; color: #dc2626;
          border: 2px solid #dc2626; border-radius: 6px;
          cursor: pointer; font-size: 0.72rem; font-family: 'DM Mono', monospace;
          transition: background 0.15s;
        }
        .ce-clear-btn:hover { background: #fecaca; }

        /* ── Dropdown (fixed overlay) ── */
        .ce-dropdown {
          position: absolute;
          top: calc(100% + 8px);
          left: 0;
          right: 0;
          background: #ffffff;
          border: 2px solid #000000;
          border-radius: 10px;
          z-index: 10000;
          max-height: 360px;
          overflow-y: auto;
          box-shadow: 0 8px 20px rgba(0,0,0,0.2);
        }
        .ce-dropdown-cat {
          padding: 0.625rem 1rem;
          background: #fafafa;
          font-size: 0.68rem; font-weight: 500; letter-spacing: 0.1em;
          color: #000000; border-bottom: 1px solid #e5e5e5;
          font-family: 'DM Mono', monospace;
        }
        .ce-dropdown-cat--folder {
          display: flex; align-items: center; gap: 0.5rem; cursor: pointer;
        }
        .ce-dropdown-cat--folder span { flex: 1; }
        .ce-dropdown-cat--folder:hover { background: #f0f0f0; }
        .ce-dropdown-sub { padding-left: 0; }
        .ce-dropdown-subcat {
          padding: 0.4rem 1.25rem;
          font-size: 0.65rem; letter-spacing: 0.08em;
          color: #666; background: #f9f9f9; border-bottom: 1px solid #f0f0f0;
          font-family: 'DM Mono', monospace;
        }
        .ce-dropdown-item {
          display: flex; justify-content: space-between; align-items: center;
          padding: 0.5rem 1.25rem;
          font-size: 0.8rem; color: #333; cursor: pointer;
          transition: background 0.12s;
          border-bottom: 1px solid #f5f5f5;
          font-family: 'DM Mono', monospace;
        }
        .ce-dropdown-item:hover { background: #f5f5f5; }
        .ce-dropdown-item--active { background: #f0fdf4; color: #16a34a; }
        .ce-select-all-btn {
          display: flex; align-items: center; gap: 0.4rem;
          margin: 0.5rem 1rem;
          padding: 0.35rem 0.75rem;
          background: #000000; color: #fff;
          border: 2px solid #000000; border-radius: 6px; cursor: pointer;
          font-size: 0.7rem; font-family: 'DM Mono', monospace;
          letter-spacing: 0.04em;
        }

        /* ── Marathi toggle ── */
        .ce-toggle-btn {
          display: inline-flex; align-items: center; gap: 0.4rem;
          padding: 0.4rem 0.875rem;
          background: #ffffff; border: 2px solid #000000;
          border-radius: 6px; cursor: pointer;
          font-size: 0.7rem; font-family: 'DM Mono', monospace;
          color: #000000; letter-spacing: 0.06em;
          transition: all 0.15s;
        }
        .ce-toggle-btn--active { background: #000000; color: #fff; border-color: #000000; }

        /* ── Translating indicator ── */
        .ce-translating {
          display: flex; align-items: center; gap: 0.3rem;
          font-size: 0.68rem; color: #888; margin-top: 0.35rem;
          letter-spacing: 0.04em;
          font-family: 'DM Mono', monospace;
        }
        .ce-spin { animation: ce-spin 1s linear infinite; }
        @keyframes ce-spin { from { transform: rotate(0deg); } to { transform: rotate(360deg); } }

        /* ── Translation cards ── */
        .ce-translation-grid {
          display: grid; grid-template-columns: 1fr 1fr; gap: 1.25rem;
        }
        .ce-lang-card {
          background: #ffffff; border: 2px solid #000000; border-radius: 10px; padding: 1.25rem;
        }
        .ce-lang-header {
          display: flex; justify-content: space-between; align-items: center;
          margin-bottom: 1rem; flex-wrap: wrap; gap: 0.5rem;
        }
        .ce-lang-badge {
          padding: 0.3rem 0.75rem;
          border-radius: 20px;
          font-size: 0.68rem; font-weight: 500; letter-spacing: 0.08em;
          font-family: 'DM Mono', monospace;
          border: 2px solid #000000;
        }
        .ce-lang-badge--hi { background: #000000; color: #fff; }
        .ce-lang-badge--mr { background: #000000; color: #fff; }
        .ce-lang-actions { display: flex; gap: 0.5rem; }
        .ce-action-btn {
          display: inline-flex; align-items: center; gap: 0.35rem;
          padding: 0.3rem 0.75rem;
          background: #ffffff; border: 2px solid #000000;
          border-radius: 6px; cursor: pointer;
          font-size: 0.7rem; font-family: 'DM Mono', monospace; color: #000000;
          transition: all 0.15s;
        }
        .ce-action-btn-black {
          background: #000000;
          color: #fff;
          border-color: #000000;
        }
        .ce-action-btn-black:hover:not(:disabled) {
          background: #000000;
          color: #fff;
          border-color: #000000;
          transform: translateY(-1px);
        }
        .ce-action-btn:hover:not(:disabled) {
          background: #000000;
          color: #fff;
          border-color: #000000;
          transform: translateY(-1px);
        }
        .ce-action-btn:disabled { opacity: 0.4; cursor: not-allowed; }

        /* ── Upload ── */
        .ce-upload-area {
          border: 2px dashed #000000;
          border-radius: 10px; padding: 2.5rem;
          text-align: center; background: rgba(255, 255, 255, 0.8);
          cursor: pointer; transition: all 0.2s;
          display: flex; flex-direction: column; align-items: center; gap: 0.75rem;
          color: #666;
        }
        .ce-upload-area:hover { border-color: #000000; background: rgba(255, 255, 255, 0.9); }
        .ce-upload-area--active { border-color: #22c55e; background: #f0fdf4; color: #16a34a; }
        .ce-upload-text { font-size: 0.875rem; color: inherit; margin: 0; font-family: 'DM Mono', monospace; }
        .ce-upload-sub { font-size: 0.7rem; color: #999; margin: 0; font-family: 'DM Mono', monospace; }
        .ce-file-list {
          margin-top: 1rem; border: 2px solid #000000; border-radius: 8px; overflow: hidden;
        }
        .ce-file-list-header {
          display: flex; justify-content: space-between; padding: 0.625rem 1rem;
          background: #f5f5f5;
          font-size: 0.65rem; letter-spacing: 0.1em; font-weight: 500; color: #000000;
          border-bottom: 2px solid #000000;
          font-family: 'DM Mono', monospace;
        }
        .ce-file-row {
          display: flex; justify-content: space-between; align-items: center;
          padding: 0.75rem 1rem; border-bottom: 1px solid #e5e5e5;
          background: #fff;
        }
        .ce-file-info { display: flex; align-items: center; gap: 0.75rem; color: #666; }
        .ce-file-name { font-size: 0.8rem; color: #000000; margin: 0; font-family: 'DM Mono', monospace; }
        .ce-file-size { font-size: 0.68rem; color: #999; margin: 0.1rem 0 0; font-family: 'DM Mono', monospace; }
        .ce-file-remove {
          background: #fee2e2; border: 2px solid #dc2626;
          color: #dc2626; border-radius: 6px; padding: 0.35rem;
          cursor: pointer; display: flex; align-items: center;
          transition: background 0.15s;
        }
        .ce-file-remove:hover { background: #fecaca; }

        /* ── Postal grid ── */
        .ce-postal-grid {
          display: grid;
          grid-template-columns: 1fr 1fr;
          gap: 1.5rem;
          align-items: start;
        }
        .ce-postal-grid .ce-field {
          margin: 0;
          display: flex;
          flex-direction: column;
          height: 100%;
        }
        .ce-postal-grid .ce-field .ce-hint {
          margin-top: 0.5rem;
        }
        .ce-date-grid {
          display: grid; grid-template-columns: 1fr 1fr; gap: 1.5rem;
        }
        .ce-date-grid .ce-field {
          margin: 0;
        }
        .ce-date-grid .ce-hint {
          margin-top: 0.5rem;
        }

        /* ── Toggle group ── */
        .ce-toggle-group { display: flex; gap: 0; border: 2px solid #000000; border-radius: 8px; overflow: hidden; margin-top: 0.1rem; }
        .ce-toggle {
          flex: 1; padding: 0.75rem 1rem;
          background: #ffffff; border: none; cursor: pointer;
          font-size: 0.75rem; font-family: 'DM Mono', monospace;
          letter-spacing: 0.1em; font-weight: 500; color: #666;
          transition: all 0.15s;
        }
        .ce-toggle:first-child { border-right: 2px solid #000000; }
        .ce-toggle--active { background: #000000; color: #fff; }

        /* ── Buttons ── */
        .ce-btn {
          display: inline-flex; align-items: center; gap: 0.5rem;
          padding: 0.7rem 1.25rem;
          border-radius: 8px; border: 2px solid transparent; cursor: pointer;
          font-size: 0.75rem; font-family: 'DM Mono', monospace;
          font-weight: 500; letter-spacing: 0.06em;
          transition: all 0.15s; white-space: nowrap;
        }
        .ce-btn:disabled { opacity: 0.4; cursor: not-allowed; transform: none !important; }
        .ce-btn-green { background: #16a34a; color: #fff; border-color: #16a34a; }
        .ce-btn-green:hover:not(:disabled) { background: #16a34a; transform: translateY(-2px); }
        .ce-btn-red { background: #dc2626; color: #fff; border-color: #dc2626; }
        .ce-btn-red:hover:not(:disabled) { background: #dc2626; transform: translateY(-2px); }
        .ce-btn-black { background: #000000; color: #fff; border-color: #000000; }
        .ce-btn-black:hover:not(:disabled) { background: #333; transform: translateY(-1px); }
        .ce-btn--lg { padding: 1rem 1.75rem; font-size: 0.8rem; border-radius: 10px; }

        /* ── Actions bar ── */
        .ce-actions {
          display: flex; gap: 1rem; margin: 1.75rem 0; flex-wrap: wrap;
        }

        /* ── Tips ── */
        .ce-tips {
          display: flex; gap: 1.25rem;
          background: rgba(255, 255, 255, 0.85);
          backdrop-filter: blur(10px);
          border: 2px solid #000000;
          border-radius: 12px;
          padding: 1.5rem 2rem;
          margin-top: 0.5rem;
          color: #000000;
        }
        .ce-tips-icon { flex-shrink: 0; margin-top: 2px; }
        .ce-tips-title { font-size: 0.68rem; letter-spacing: 0.12em; font-weight: 500; color: #000000; margin: 0 0 0.75rem; font-family: 'DM Mono', monospace; }
        .ce-tips-list { margin: 0; padding-left: 1rem; }
        .ce-tips-list li { font-size: 0.78rem; margin-bottom: 0.4rem; color: #333; line-height: 1.6; font-family: 'DM Mono', monospace; }
        .ce-tips-list strong { color: #000000; }

        /* ── Icons ── */
        .ce-icon-green { color: #16a34a; }
        .ce-icon-red { color: #dc2626; }

        /* ── Spinners ── */
        .ce-spinner {
          width: 36px; height: 36px;
          border: 2px solid #e5e5e5; border-top-color: #000000;
          border-radius: 50%; animation: ce-spin 0.8s linear infinite;
        }
        .ce-spinner-sm {
          width: 15px; height: 15px;
          border: 2px solid rgba(255,255,255,0.3); border-top-color: #fff;
          border-radius: 50%; animation: ce-spin 0.8s linear infinite;
          display: inline-block;
        }
        .ce-spinner-dark { border: 2px solid #e5e5e5; border-top-color: #000000; }

        /* ── Responsive ── */
        @media (max-width: 768px) {
          .ce-root { padding: 1rem; }
          .ce-header { flex-direction: column; align-items: flex-start; gap: 1rem; }
          .ce-balance-grid, .ce-translation-grid { grid-template-columns: 1fr; }
          .ce-postal-grid, .ce-date-grid { grid-template-columns: 1fr; }
          .ce-field--full { grid-column: 1; }
          .ce-actions { flex-direction: column; }
          .ce-btn--lg { width: 100%; justify-content: center; }
          .ce-section { padding: 1.25rem; }
        }
        @media (max-width: 640px) {
          .ce-txn-row { flex-direction: column; }
          .ce-lang-header { flex-direction: column; align-items: flex-start; }
        }
      `}</style>
    </div>
  );
};

export default ComposeEmail;