import React, { useState } from 'react';
import * as govService from '../../services/governance.service';

export function EvidenceSubmissionModal({ isOpen, onClose, campaign, onEvidenceSubmitted }) {
  const [explanation, setExplanation] = useState('');
  const [documents, setDocuments] = useState([
    { name: '', url: '' },
  ]);
  const [images, setImages] = useState([
    { name: '', url: '' },
  ]);
  const [videos, setVideos] = useState([
    { name: '', url: '' },
  ]);
  const [submitting, setSubmitting] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');
  const [successMsg, setSuccessMsg] = useState('');

  if (!isOpen || !campaign) return null;

  const campaignId = campaign._id || campaign.id;

  const handleAddDoc = () => setDocuments([...documents, { name: '', url: '' }]);
  const handleRemoveDoc = (index) => setDocuments(documents.filter((_, i) => i !== index));

  const handleAddImage = () => setImages([...images, { name: '', url: '' }]);
  const handleRemoveImage = (index) => setImages(images.filter((_, i) => i !== index));

  const handleAddVideo = () => setVideos([...videos, { name: '', url: '' }]);
  const handleRemoveVideo = (index) => setVideos(videos.filter((_, i) => i !== index));

  const handleAutofillDemo = () => {
    setExplanation(
      `We categorically refute any allegation of inactivity or misuse. For "${campaign.title}", Phase 1 field logistics have been fully deployed. 12 municipal water tankers with GPS telemetry were dispatched, community cisterns filled, and water quality testing was completed by independent auditors. Attached are certified supplier invoices, geotagged on-site delivery images, and drone field footage.`
    );
    setDocuments([
      { name: 'Municipal_Water_Supply_Contract_Invoice_#4829.pdf', url: 'https://bridge-governance.org/docs/audit_invoice_4829.pdf' },
      { name: 'Water_Quality_Purity_Lab_Certificate.pdf', url: 'https://bridge-governance.org/docs/lab_certificate.pdf' },
    ]);
    setImages([
      { name: 'Field Delivery Tankers at Station 4', url: '/images/campaign_water.jpg' },
      { name: 'Beneficiary Community Distribution Proof', url: '/images/hero_hands.jpg' },
    ]);
    setVideos([
      { name: 'On-Ground Drone Inspection & Water Distribution Feed', url: 'https://youtube.com/watch?v=field_verification_demo' },
    ]);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!explanation.trim()) {
      setErrorMsg('Please provide a detailed explanation addressing the governance freeze.');
      return;
    }

    setSubmitting(true);
    setErrorMsg('');

    try {
      const validDocs = documents.filter((d) => d.name && d.name.trim());
      const validImages = images.filter((i) => i.name && i.name.trim());
      const validVideos = videos.filter((v) => v.name && v.name.trim());

      const res = await govService.submitEvidence(campaignId, {
        explanation: explanation.trim(),
        documents: validDocs,
        images: validImages,
        videos: validVideos,
      });

      setSuccessMsg('Evidence successfully registered! The weighted donor voting round is now LIVE.');
      if (onEvidenceSubmitted) {
        onEvidenceSubmitted(res);
      }
      setTimeout(() => {
        onClose();
      }, 2000);
    } catch (err) {
      setErrorMsg(err.message || 'Failed to submit evidence');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div
      style={{
        position: 'fixed',
        inset: 0,
        backgroundColor: 'rgba(15, 23, 42, 0.65)',
        backdropFilter: 'blur(5px)',
        zIndex: 9999,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        padding: '16px',
      }}
    >
      <div
        className="bridge-card"
        style={{
          width: '100%',
          maxWidth: '680px',
          maxHeight: '90vh',
          overflowY: 'auto',
          padding: '28px',
          borderRadius: 'var(--radius-lg)',
          boxShadow: 'var(--shadow-xl)',
          backgroundColor: '#ffffff',
          position: 'relative',
        }}
      >
        {/* Close Button */}
        <button
          onClick={onClose}
          style={{
            position: 'absolute',
            top: '16px',
            right: '16px',
            background: 'none',
            border: 'none',
            fontSize: '1.25rem',
            color: 'var(--text-muted)',
            cursor: 'pointer',
            padding: '4px 8px',
          }}
        >
          ✕
        </button>

        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: '10px', marginBottom: '14px' }}>
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <span style={{ fontSize: '1.4rem' }}>📁</span>
              <h2 style={{ fontSize: '1.25rem', fontWeight: 800, color: 'var(--text-dark)', margin: 0 }}>
                Submit Governance Evidence
              </h2>
            </div>
            <p style={{ fontSize: '0.82rem', color: 'var(--text-muted)', margin: '4px 0 0 0' }}>
              Campaign: <strong>{campaign.title}</strong>
            </p>
          </div>

          <button
            type="button"
            onClick={handleAutofillDemo}
            style={{
              padding: '6px 12px',
              backgroundColor: 'rgba(16, 185, 129, 0.1)',
              color: 'var(--primary-green)',
              border: '1px solid rgba(16, 185, 129, 0.3)',
              borderRadius: 'var(--radius-sm)',
              fontSize: '0.78rem',
              fontWeight: 700,
              cursor: 'pointer',
            }}
          >
            ⚡ Auto-Fill Demo Proofs
          </button>
        </div>

        <div
          style={{
            backgroundColor: 'rgba(239, 68, 68, 0.08)',
            border: '1px solid rgba(239, 68, 68, 0.25)',
            borderRadius: 'var(--radius-sm)',
            padding: '12px',
            marginBottom: '18px',
            fontSize: '0.8rem',
            color: 'var(--danger-red)',
            lineHeight: 1.45,
          }}
        >
          <strong>⚠️ Governance Status:</strong> Funds are currently frozen. Once your documentation and media are submitted, eligible community donors will review the materials and vote with weighted stake to resume disbursements or initiate refunds.
        </div>

        {errorMsg && (
          <div style={{ backgroundColor: 'rgba(239, 68, 68, 0.1)', color: 'var(--danger-red)', padding: '10px', borderRadius: '4px', fontSize: '0.82rem', marginBottom: '14px' }}>
            {errorMsg}
          </div>
        )}

        {successMsg && (
          <div style={{ backgroundColor: 'rgba(16, 185, 129, 0.1)', color: 'var(--primary-green)', padding: '10px', borderRadius: '4px', fontSize: '0.84rem', fontWeight: 700, marginBottom: '14px' }}>
            ✓ {successMsg}
          </div>
        )}

        <form onSubmit={handleSubmit}>
          {/* Explanation */}
          <div style={{ marginBottom: '18px' }}>
            <label style={{ display: 'block', fontSize: '0.84rem', fontWeight: 700, color: 'var(--text-dark)', marginBottom: '6px' }}>
              Detailed Justification & Work Explanation <span style={{ color: 'var(--danger-red)' }}>*</span>
            </label>
            <textarea
              rows="4"
              required
              value={explanation}
              onChange={(e) => setExplanation(e.target.value)}
              placeholder="Explain how allocated funds were deployed, describe on-ground milestones, address donor concerns, and provide operational context..."
              style={{
                width: '100%',
                padding: '10px 12px',
                borderRadius: 'var(--radius-sm)',
                border: '1px solid var(--border-light)',
                fontSize: '0.86rem',
                fontFamily: 'inherit',
                outline: 'none',
                resize: 'vertical',
              }}
            />
          </div>

          {/* Documents Section */}
          <div style={{ marginBottom: '18px' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '8px' }}>
              <label style={{ fontSize: '0.84rem', fontWeight: 700, color: 'var(--text-dark)' }}>
                📄 Documents (Invoices, Receipts, Audits)
              </label>
              <button
                type="button"
                onClick={handleAddDoc}
                style={{ fontSize: '0.74rem', color: 'var(--accent-blue)', background: 'none', border: 'none', fontWeight: 700, cursor: 'pointer' }}
              >
                + Add Document
              </button>
            </div>
            {documents.map((doc, idx) => (
              <div key={idx} style={{ display: 'flex', gap: '8px', marginBottom: '8px' }}>
                <input
                  type="text"
                  placeholder="Document Name / Label"
                  value={doc.name}
                  onChange={(e) => {
                    const updated = [...documents];
                    updated[idx].name = e.target.value;
                    setDocuments(updated);
                  }}
                  style={{ flex: 1, padding: '8px 10px', fontSize: '0.84rem', border: '1px solid var(--border-light)', borderRadius: 'var(--radius-sm)' }}
                />
                <input
                  type="text"
                  placeholder="Document URL / IPFS Link"
                  value={doc.url}
                  onChange={(e) => {
                    const updated = [...documents];
                    updated[idx].url = e.target.value;
                    setDocuments(updated);
                  }}
                  style={{ flex: 1.5, padding: '8px 10px', fontSize: '0.84rem', border: '1px solid var(--border-light)', borderRadius: 'var(--radius-sm)' }}
                />
                {documents.length > 1 && (
                  <button
                    type="button"
                    onClick={() => handleRemoveDoc(idx)}
                    style={{ background: 'none', border: 'none', color: 'var(--danger-red)', cursor: 'pointer', padding: '0 6px' }}
                  >
                    ✕
                  </button>
                )}
              </div>
            ))}
          </div>

          {/* Images Section */}
          <div style={{ marginBottom: '18px' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '8px' }}>
              <label style={{ fontSize: '0.84rem', fontWeight: 700, color: 'var(--text-dark)' }}>
                🖼️ Image Proofs (Field Photos, Equipment)
              </label>
              <button
                type="button"
                onClick={handleAddImage}
                style={{ fontSize: '0.74rem', color: 'var(--accent-blue)', background: 'none', border: 'none', fontWeight: 700, cursor: 'pointer' }}
              >
                + Add Image
              </button>
            </div>
            {images.map((img, idx) => (
              <div key={idx} style={{ display: 'flex', gap: '8px', marginBottom: '8px' }}>
                <input
                  type="text"
                  placeholder="Image Title"
                  value={img.name}
                  onChange={(e) => {
                    const updated = [...images];
                    updated[idx].name = e.target.value;
                    setImages(updated);
                  }}
                  style={{ flex: 1, padding: '8px 10px', fontSize: '0.84rem', border: '1px solid var(--border-light)', borderRadius: 'var(--radius-sm)' }}
                />
                <input
                  type="text"
                  placeholder="Image URL (e.g. /images/campaign_water.jpg)"
                  value={img.url}
                  onChange={(e) => {
                    const updated = [...images];
                    updated[idx].url = e.target.value;
                    setImages(updated);
                  }}
                  style={{ flex: 1.5, padding: '8px 10px', fontSize: '0.84rem', border: '1px solid var(--border-light)', borderRadius: 'var(--radius-sm)' }}
                />
                {images.length > 1 && (
                  <button
                    type="button"
                    onClick={() => handleRemoveImage(idx)}
                    style={{ background: 'none', border: 'none', color: 'var(--danger-red)', cursor: 'pointer', padding: '0 6px' }}
                  >
                    ✕
                  </button>
                )}
              </div>
            ))}
          </div>

          {/* Videos Section */}
          <div style={{ marginBottom: '22px' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '8px' }}>
              <label style={{ fontSize: '0.84rem', fontWeight: 700, color: 'var(--text-dark)' }}>
                🎥 Video Demonstrations (Walkthroughs, Interviews)
              </label>
              <button
                type="button"
                onClick={handleAddVideo}
                style={{ fontSize: '0.74rem', color: 'var(--accent-blue)', background: 'none', border: 'none', fontWeight: 700, cursor: 'pointer' }}
              >
                + Add Video
              </button>
            </div>
            {videos.map((vid, idx) => (
              <div key={idx} style={{ display: 'flex', gap: '8px', marginBottom: '8px' }}>
                <input
                  type="text"
                  placeholder="Video Title"
                  value={vid.name}
                  onChange={(e) => {
                    const updated = [...videos];
                    updated[idx].name = e.target.value;
                    setVideos(updated);
                  }}
                  style={{ flex: 1, padding: '8px 10px', fontSize: '0.84rem', border: '1px solid var(--border-light)', borderRadius: 'var(--radius-sm)' }}
                />
                <input
                  type="text"
                  placeholder="Video URL / Embed Link"
                  value={vid.url}
                  onChange={(e) => {
                    const updated = [...videos];
                    updated[idx].url = e.target.value;
                    setVideos(updated);
                  }}
                  style={{ flex: 1.5, padding: '8px 10px', fontSize: '0.84rem', border: '1px solid var(--border-light)', borderRadius: 'var(--radius-sm)' }}
                />
                {videos.length > 1 && (
                  <button
                    type="button"
                    onClick={() => handleRemoveVideo(idx)}
                    style={{ background: 'none', border: 'none', color: 'var(--danger-red)', cursor: 'pointer', padding: '0 6px' }}
                  >
                    ✕
                  </button>
                )}
              </div>
            ))}
          </div>

          <div style={{ display: 'flex', gap: '10px', justifyContent: 'flex-end' }}>
            <button
              type="button"
              onClick={onClose}
              className="btn-secondary"
              style={{ padding: '9px 18px', fontSize: '0.88rem' }}
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={submitting}
              className="btn-primary"
              style={{ padding: '9px 24px', fontSize: '0.88rem', fontWeight: 700 }}
            >
              {submitting ? 'Submitting Evidence...' : '📤 Submit Evidence & Open Donor Voting'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
