import React from 'react';
import { X, Download, Upload, RotateCcw, FileText } from 'lucide-react';
import { SAMPLE_SUBSCRIPTIONS } from '../constants';

export default function ExportImportModal({
  isOpen,
  onClose,
  subscriptions,
  onImport,
  onResetDemo
}) {
  if (!isOpen) return null;

  // Export JSON file download
  const handleExport = () => {
    const dataStr = "data:text/json;charset=utf-8," + encodeURIComponent(JSON.stringify(subscriptions, null, 2));
    const downloadAnchor = document.createElement('a');
    downloadAnchor.setAttribute("href", dataStr);
    downloadAnchor.setAttribute("download", `subsync_backup_${new Date().toISOString().split('T')[0]}.json`);
    document.body.appendChild(downloadAnchor);
    downloadAnchor.click();
    downloadAnchor.remove();
  };

  // Import JSON file reader
  const handleFileUpload = (e) => {
    const fileReader = new FileReader();
    if (e.target.files && e.target.files[0]) {
      fileReader.readAsText(e.target.files[0], "UTF-8");
      fileReader.onload = (event) => {
        try {
          const parsed = JSON.parse(event.target.result);
          if (Array.isArray(parsed)) {
            onImport(parsed);
            alert(`Successfully restored ${parsed.length} subscriptions!`);
            onClose();
          } else {
            alert("Invalid JSON format. Expected an array of subscription objects.");
          }
        } catch (err) {
          alert("Error parsing JSON file: " + err.message);
        }
      };
    }
  };

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-content" style={{ maxWidth: '520px' }} onClick={(e) => e.stopPropagation()}>
        <div className="modal-header">
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            <Download size={20} color="var(--primary)" />
            <h2 className="modal-title">Backup & Restore</h2>
          </div>
          <button className="modal-close" onClick={onClose}>
            <X size={20} />
          </button>
        </div>

        <div style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
          {/* Export */}
          <div 
            style={{ 
              background: 'rgba(0,0,0,0.25)', 
              border: '1px solid var(--border-glass)', 
              borderRadius: 'var(--radius-md)', 
              padding: '1.25rem',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between'
            }}
          >
            <div>
              <h4 style={{ fontSize: '1rem', fontWeight: '700', marginBottom: '0.2rem' }}>Export Data (JSON)</h4>
              <p style={{ fontSize: '0.8rem', color: 'var(--text-secondary)' }}>
                Download a JSON backup file of your {subscriptions.length} subscriptions.
              </p>
            </div>
            <button className="btn btn-primary" onClick={handleExport}>
              <Download size={16} />
              <span>Export</span>
            </button>
          </div>

          {/* Import */}
          <div 
            style={{ 
              background: 'rgba(0,0,0,0.25)', 
              border: '1px solid var(--border-glass)', 
              borderRadius: 'var(--radius-md)', 
              padding: '1.25rem',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between'
            }}
          >
            <div>
              <h4 style={{ fontSize: '1rem', fontWeight: '700', marginBottom: '0.2rem' }}>Restore Backup</h4>
              <p style={{ fontSize: '0.8rem', color: 'var(--text-secondary)' }}>
                Upload a previously exported SubSync `.json` file.
              </p>
            </div>
            <label className="btn btn-secondary" style={{ cursor: 'pointer' }}>
              <Upload size={16} />
              <span>Import</span>
              <input type="file" accept=".json" onChange={handleFileUpload} style={{ display: 'none' }} />
            </label>
          </div>

          {/* Reset Demo Data */}
          <div 
            style={{ 
              background: 'rgba(239, 68, 68, 0.08)', 
              border: '1px solid rgba(239, 68, 68, 0.2)', 
              borderRadius: 'var(--radius-md)', 
              padding: '1.25rem',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between'
            }}
          >
            <div>
              <h4 style={{ fontSize: '1rem', fontWeight: '700', color: '#EF4444', marginBottom: '0.2rem' }}>Reset Demo Data</h4>
              <p style={{ fontSize: '0.8rem', color: 'var(--text-secondary)' }}>
                Restore default pre-loaded sample subscriptions.
              </p>
            </div>
            <button 
              className="btn btn-secondary" 
              style={{ borderColor: 'rgba(239, 68, 68, 0.4)', color: '#EF4444' }}
              onClick={() => {
                if (confirm("Are you sure you want to reset subscriptions to sample data?")) {
                  onResetDemo();
                  onClose();
                }
              }}
            >
              <RotateCcw size={16} />
              <span>Reset</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
