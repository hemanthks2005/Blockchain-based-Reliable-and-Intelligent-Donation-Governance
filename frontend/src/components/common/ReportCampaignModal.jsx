import React, { useState } from 'react';
import * as govService from '../../services/governance.service';

export function ReportCampaignModal({ isOpen, onClose, campaign, onReportSuccess }) {
  const [reason, setReason] = useState('MISUSE_OF_FUNDS');
  const [details, setDetails] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');
  const [successResult, setSuccessResult] = useState(null);

  if (!isOpen || !campaign) return null;

  const campaignId = campaign._id || campaign.id;

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!details.trim()) {
      setErrorMsg('Please describe why you believe this campaign requires governance review.');
      return;
    }

    setSubmitting(true);
    setErrorMsg('');

    try {
      const res = await govService.reportCampaign(campaignId, reason, details.trim());
      setSuccessResult(res);
      if (onReportSuccess) {
        onReportSuccess(res);
      }
    } catch (err) {
      setErrorMsg(err.message || 'Failed to submit report. Please try again.');
    } finally {
      setSubmitting(false);
    }
  };

  const handleClose = () => {
    setReason('MISUSE_OF_FUNDS');
    setDetails('');
    setErrorMsg('');
    setSuccessResult(null);
    onClose();
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
          maxWidth: '540px',
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
          onClick={handleClose}
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

        {successResult ? (
          <div>
            <div style={{ textAlign: 'center', padding: '16px 0' }}>
              <div
                style={{
                  width: '64px',
                  height: '64px',
                  borderRadius: '50%',
                  backgroundColor: successResult.triggeredFreeze ? 'rgba(239, 68, 68, 0.12)' : 'rgba(16, 185, 129, 0.12)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  fontSize: '2rem',
                  margin: '0 auto 16px',
                }}
              >
                {successResult.triggeredFreeze ? '🔒' : '🛡️'}
              </div>

              <h2 style={{ fontSize: '1.3rem', fontWeight: 800, color: 'var(--text-dark)', marginBottom: '8px' }}>
                {successResult.triggeredFreeze
                  ? 'Campaign Frozen for Governance Review!'
                  : 'Suspicious Report Logged'}
              </h2>

              <p style={{ fontSize: '0.88rem', color: 'var(--text-muted)', lineHeight: 1.5, marginBottom: '20px' }}>
                {successResult.message}
              </p>

              {successResult.triggeredFreeze && (
                <div
                  style={{
                    backgroundColor: 'rgba(239, 68, 68, 0.08)',
                    border: '1px solid rgba(239, 68, 68, 0.25)',
                    borderRadius: 'var(--radius-md)',
                    padding: '14px',
                    textAlign: 'left',
                    marginBottom: '20px',
                    fontSize: '0.82rem',
                    color: 'var(--danger-red)',
                  }}
                >
                  <div style={{ fontWeight: 700, marginBottom: '4px' }}>⚡ Automated Governance Action Executed:</div>
                  <ul style={{ margin: 0, paddingLeft: '18px' }}>
                    <li>Campaign status switched to <strong>UNDER REVIEW</strong></li>
                    <li>All donation intakes and beneficiary fund releases are <strong>FROZEN</strong></li>
                    <li>Beneficiary has been notified to submit proof & documentation</li>
                    <li>Eligible donors will vote with weighted power on whether to resume or refund</li>
                  </ul>
                </div>
              )}

              <button
                onClick={handleClose}
                className="btn-primary"
                style={{ padding: '10px 24px', fontSize: '0.9rem', width: '100%' }}
              >
                Done
              </button>
            </div>
          </div>
        ) : (
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '8px' }}>
              <span style={{ fontSize: '1.5rem' }}>🚨</span>
              <h2 style={{ fontSize: '1.25rem', fontWeight: 800, color: 'var(--text-dark)', margin: 0 }}>
                Report Suspicious Initiative
              </h2>
            </div>

            <p style={{ fontSize: '0.84rem', color: 'var(--text-muted)', marginBottom: '18px' }}>
              Reporting initiative: <strong>{campaign.title}</strong>
            </p>

            <div
              style={{
                backgroundColor: 'rgba(59, 130, 246, 0.08)',
                border: '1px solid rgba(59, 130, 246, 0.2)',
                borderRadius: 'var(--radius-sm)',
                padding: '12px 14px',
                fontSize: '0.8rem',
                color: 'var(--accent-blue)',
                lineHeight: 1.45,
                marginBottom: '20px',
              }}
            >
              🏛️ <strong>Decentralized Governance Rule:</strong> When community reports reach the configurable threshold, campaign funds and release approvals are immediately <strong>frozen</strong>. The beneficiary must provide verification documents, images, and videos for donor weighted voting.
            </div>

            {errorMsg && (
              <div
                style={{
                  backgroundColor: 'rgba(239, 68, 68, 0.1)',
                  color: 'var(--danger-red)',
                  padding: '10px 14px',
                  borderRadius: 'var(--radius-sm)',
                  fontSize: '0.84rem',
                  fontWeight: 600,
                  marginBottom: '16px',
                }}
              >
                ⚠️ {errorMsg}
              </div>
            )}

            <form onSubmit={handleSubmit}>
              <div style={{ marginBottom: '16px' }}>
                <label style={{ display: 'block', fontSize: '0.84rem', fontWeight: 700, color: 'var(--text-dark)', marginBottom: '6px' }}>
                  Reason for Concern <span style={{ color: 'var(--danger-red)' }}>*</span>
                </label>
                <select
                  value={reason}
                  onChange={(e) => setReason(e.target.value)}
                  style={{
                    width: '100%',
                    padding: '10px 12px',
                    borderRadius: 'var(--radius-sm)',
                    border: '1px solid var(--border-light)',
                    fontSize: '0.88rem',
                    outline: 'none',
                    backgroundColor: '#fff',
                  }}
                >
                  <option value="MISUSE_OF_FUNDS">Misuse of Funds / Inflated Budget</option>
                  <option value="SUSPICIOUS_ACTIVITY">Suspicious Activity / Red Flags</option>
                  <option value="FAKE_DOCUMENTATION">Fake / Forged Documentation</option>
                  <option value="INACTION_NO_PROGRESS">Zero On-Ground Progress or Communication</option>
                  <option value="OTHER">Other Violation of Philanthropic Governance</option>
                </select>
              </div>

              <div style={{ marginBottom: '22px' }}>
                <label style={{ display: 'block', fontSize: '0.84rem', fontWeight: 700, color: 'var(--text-dark)', marginBottom: '6px' }}>
                  Detailed Description & Evidence Observations <span style={{ color: 'var(--danger-red)' }}>*</span>
                </label>
                <textarea
                  rows="4"
                  required
                  value={details}
                  onChange={(e) => setDetails(e.target.value)}
                  placeholder="Describe your findings, discrepancies in invoices or milestones, lack of field activity, or suspicious claims..."
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

              <div style={{ display: 'flex', gap: '10px', justifyContent: 'flex-end' }}>
                <button
                  type="button"
                  onClick={handleClose}
                  className="btn-secondary"
                  style={{ padding: '8px 18px', fontSize: '0.88rem' }}
                >
                  Cancel
                </button>

                <button
                  type="submit"
                  disabled={submitting}
                  style={{
                    padding: '8px 20px',
                    backgroundColor: 'var(--danger-red)',
                    color: '#ffffff',
                    border: 'none',
                    borderRadius: 'var(--radius-sm)',
                    fontSize: '0.88rem',
                    fontWeight: 700,
                    cursor: submitting ? 'wait' : 'pointer',
                    opacity: submitting ? 0.75 : 1,
                  }}
                >
                  {submitting ? 'Submitting Report...' : '🚨 Submit Governance Report'}
                </button>
              </div>
            </form>
          </div>
        )}
      </div>
    </div>
  );
}
