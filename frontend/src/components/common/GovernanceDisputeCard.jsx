import React, { useState, useEffect } from 'react';
import * as govService from '../../services/governance.service';
import { useAuth, ROLES } from '../../context/AuthContext';

export function GovernanceDisputeCard({ campaignId, onStatusChange }) {
  const { role } = useAuth();
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [voting, setVoting] = useState(false);
  const [finalizing, setFinalizing] = useState(false);
  const [feedback, setFeedback] = useState(null);
  const [feedbackType, setFeedbackType] = useState('success');

  const loadDispute = async () => {
    if (!campaignId) return;
    try {
      setLoading(true);
      const res = await govService.fetchDisputeDetails(campaignId);
      setData(res);
    } catch (err) {
      console.warn('Could not load dispute details:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadDispute();
  }, [campaignId]);

  if (loading || !data || !data.dispute) return null;

  const { dispute, campaign, eligibility } = data;

  // If campaign is active with no reports, no need to show dispute card
  if (dispute.status === 'ACTIVE_CAMPAIGN' && dispute.reportCount === 0) {
    return null;
  }

  const handleVote = async (voteChoice) => {
    setVoting(true);
    setFeedback(null);
    try {
      const res = await govService.castGovernanceVote(campaignId, voteChoice);
      setFeedbackType('success');
      setFeedback(res.message);
      await loadDispute();
      if (onStatusChange) onStatusChange(res.dispute);
    } catch (err) {
      setFeedbackType('error');
      setFeedback(err.message || 'Failed to cast vote');
    } finally {
      setVoting(false);
    }
  };

  const handleFinalize = async () => {
    setFinalizing(true);
    setFeedback(null);
    try {
      const res = await govService.finalizeGovernanceDispute(campaignId);
      setFeedbackType(res.isApproved ? 'success' : 'error');
      setFeedback(res.message);
      await loadDispute();
      if (onStatusChange) onStatusChange(res.dispute);
    } catch (err) {
      setFeedbackType('error');
      setFeedback(err.message || 'Failed to finalize dispute');
    } finally {
      setFinalizing(false);
    }
  };

  const approveWeight = Number(dispute.voting?.approveWeight || 0);
  const rejectWeight = Number(dispute.voting?.rejectWeight || 0);
  const totalWeight = approveWeight + rejectWeight;
  const approvePct = totalWeight > 0 ? Math.round((approveWeight / totalWeight) * 100) : 50;
  const rejectPct = totalWeight > 0 ? 100 - approvePct : 50;

  const isFrozen = campaign.isFrozen || dispute.status === 'FROZEN_PENDING_EVIDENCE' || dispute.status === 'VOTING_OPEN';
  const isVotingOpen = dispute.status === 'VOTING_OPEN' || dispute.status === 'EVIDENCE_SUBMITTED';
  const isResolved = dispute.status === 'RESOLVED_APPROVED' || dispute.status === 'RESOLVED_REJECTED';

  return (
    <div
      className="bridge-card"
      style={{
        border: isFrozen ? '2px solid var(--danger-red)' : isResolved ? '2px solid var(--border-light)' : '1px solid var(--border-light)',
        borderRadius: 'var(--radius-lg)',
        padding: '24px',
        marginBottom: '28px',
        backgroundColor: '#ffffff',
        boxShadow: isFrozen ? '0 4px 20px rgba(239, 68, 68, 0.12)' : 'var(--shadow-md)',
      }}
    >
      {/* Header Banner */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: '12px', marginBottom: '16px' }}>
        <div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '4px' }}>
            <span style={{ fontSize: '1.4rem' }}>
              {dispute.status === 'RESOLVED_APPROVED' ? '✅' : dispute.status === 'RESOLVED_REJECTED' ? '❌' : '⚖️'}
            </span>
            <h3 style={{ fontSize: '1.2rem', fontWeight: 800, color: 'var(--text-dark)', margin: 0 }}>
              Governance Dispute & Auditing Center
            </h3>
          </div>
          <p style={{ fontSize: '0.82rem', color: 'var(--text-muted)', margin: 0 }}>
            Decentralized community oversight and weighted democratic resolution protocol
          </p>
        </div>

        <div>
          {dispute.status === 'FROZEN_PENDING_EVIDENCE' && (
            <span style={{ backgroundColor: 'rgba(239, 68, 68, 0.15)', color: 'var(--danger-red)', padding: '6px 12px', borderRadius: 'var(--radius-full)', fontSize: '0.76rem', fontWeight: 700 }}>
              🔒 FROZEN — Awaiting Evidence
            </span>
          )}
          {dispute.status === 'VOTING_OPEN' && (
            <span style={{ backgroundColor: 'rgba(59, 130, 246, 0.15)', color: 'var(--accent-blue)', padding: '6px 12px', borderRadius: 'var(--radius-full)', fontSize: '0.76rem', fontWeight: 700 }}>
              🗳️ VOTING OPEN — Weighted Donor Stake
            </span>
          )}
          {dispute.status === 'RESOLVED_APPROVED' && (
            <span className="badge-approved" style={{ fontSize: '0.78rem', padding: '6px 14px' }}>
              ✓ RESOLVED: APPROVED (Disbursements Resumed)
            </span>
          )}
          {dispute.status === 'RESOLVED_REJECTED' && (
            <span style={{ backgroundColor: 'rgba(239, 68, 68, 0.15)', color: 'var(--danger-red)', padding: '6px 12px', borderRadius: 'var(--radius-full)', fontSize: '0.78rem', fontWeight: 700 }}>
              ✗ RESOLVED: REJECTED (Refunds Initiated)
            </span>
          )}
          {dispute.status === 'ACTIVE_CAMPAIGN' && (
            <span style={{ backgroundColor: 'rgba(245, 158, 11, 0.15)', color: '#d97706', padding: '6px 12px', borderRadius: 'var(--radius-full)', fontSize: '0.76rem', fontWeight: 700 }}>
              ⚠️ {dispute.reportCount} of {dispute.threshold || 2} Suspicious Reports
            </span>
          )}
        </div>
      </div>

      {/* Freeze / Reason Notice Box */}
      {dispute.freezeReason && (
        <div
          style={{
            backgroundColor: isFrozen ? 'rgba(239, 68, 68, 0.08)' : 'var(--bg-subtle)',
            border: `1px solid ${isFrozen ? 'rgba(239, 68, 68, 0.25)' : 'var(--border-light)'}`,
            borderRadius: 'var(--radius-md)',
            padding: '14px 16px',
            marginBottom: '18px',
            fontSize: '0.84rem',
            color: isFrozen ? 'var(--danger-red)' : 'var(--text-dark)',
          }}
        >
          <strong>Reason for Freeze:</strong> {dispute.freezeReason}
          <div style={{ marginTop: '4px', fontSize: '0.78rem', color: 'var(--text-muted)' }}>
            Threshold configured: {dispute.threshold || 2} reports | Total Reports Received: {dispute.reportCount}
          </div>
        </div>
      )}

      {/* Feedback Messages */}
      {feedback && (
        <div
          style={{
            backgroundColor: feedbackType === 'success' ? 'rgba(16, 185, 129, 0.12)' : 'rgba(239, 68, 68, 0.12)',
            color: feedbackType === 'success' ? 'var(--primary-green)' : 'var(--danger-red)',
            padding: '12px 16px',
            borderRadius: 'var(--radius-sm)',
            fontSize: '0.86rem',
            fontWeight: 700,
            marginBottom: '18px',
          }}
        >
          {feedbackType === 'success' ? '✓ ' : '⚠️ '} {feedback}
        </div>
      )}

      {/* EVIDENCE SUBMITTED SECTION */}
      {dispute.evidence?.explanation && (
        <div
          style={{
            backgroundColor: 'var(--bg-subtle)',
            borderRadius: 'var(--radius-md)',
            border: '1px solid var(--border-light)',
            padding: '18px',
            marginBottom: '20px',
          }}
        >
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '8px' }}>
            <h4 style={{ fontSize: '0.94rem', fontWeight: 800, color: 'var(--text-dark)', margin: 0 }}>
              📂 Beneficiary Verification Evidence & Defense
            </h4>
            <span style={{ fontSize: '0.74rem', color: 'var(--text-muted)' }}>
              Submitted {new Date(dispute.evidence.submittedAt || Date.now()).toLocaleDateString()}
            </span>
          </div>

          <p style={{ fontSize: '0.86rem', color: 'var(--text-main)', lineHeight: 1.55, margin: '0 0 14px 0', whiteSpace: 'pre-line' }}>
            "{dispute.evidence.explanation}"
          </p>

          {/* Attached Documents */}
          {dispute.evidence.documents?.length > 0 && (
            <div style={{ marginBottom: '12px' }}>
              <div style={{ fontSize: '0.76rem', fontWeight: 700, color: 'var(--text-muted)', textTransform: 'uppercase', marginBottom: '6px' }}>
                Attached Document Invoices & Lab Reports
              </div>
              <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px' }}>
                {dispute.evidence.documents.map((doc, idx) => (
                  <a
                    key={idx}
                    href={doc.url || '#'}
                    target="_blank"
                    rel="noreferrer"
                    style={{
                      display: 'inline-flex',
                      alignItems: 'center',
                      gap: '6px',
                      padding: '5px 12px',
                      backgroundColor: '#ffffff',
                      border: '1px solid var(--border-light)',
                      borderRadius: 'var(--radius-sm)',
                      fontSize: '0.78rem',
                      color: 'var(--accent-blue)',
                      fontWeight: 600,
                      textDecoration: 'none',
                    }}
                  >
                    📄 {doc.name || 'Verified Invoice / Proof'}
                  </a>
                ))}
              </div>
            </div>
          )}

          {/* Attached Images */}
          {dispute.evidence.images?.length > 0 && (
            <div style={{ marginBottom: '12px' }}>
              <div style={{ fontSize: '0.76rem', fontWeight: 700, color: 'var(--text-muted)', textTransform: 'uppercase', marginBottom: '6px' }}>
                On-Ground Photographic Proof
              </div>
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(140px, 1fr))', gap: '10px' }}>
                {dispute.evidence.images.map((img, idx) => (
                  <div key={idx} style={{ borderRadius: 'var(--radius-sm)', overflow: 'hidden', border: '1px solid var(--border-light)' }}>
                    <img
                      src={img.url || '/images/campaign_water.jpg'}
                      alt={img.name || 'Proof Photo'}
                      style={{ width: '100%', height: '90px', objectFit: 'cover', display: 'block' }}
                      onError={(e) => { e.currentTarget.src = '/images/campaign_water.jpg'; }}
                    />
                    <div style={{ padding: '4px 6px', fontSize: '0.72rem', color: 'var(--text-dark)', fontWeight: 600, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                      {img.name || 'Field Proof'}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Attached Videos */}
          {dispute.evidence.videos?.length > 0 && (
            <div>
              <div style={{ fontSize: '0.76rem', fontWeight: 700, color: 'var(--text-muted)', textTransform: 'uppercase', marginBottom: '6px' }}>
                Video Demonstration Feeds
              </div>
              <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px' }}>
                {dispute.evidence.videos.map((vid, idx) => (
                  <a
                    key={idx}
                    href={vid.url || '#'}
                    target="_blank"
                    rel="noreferrer"
                    style={{
                      display: 'inline-flex',
                      alignItems: 'center',
                      gap: '6px',
                      padding: '5px 12px',
                      backgroundColor: '#ffffff',
                      border: '1px solid var(--border-light)',
                      borderRadius: 'var(--radius-sm)',
                      fontSize: '0.78rem',
                      color: 'var(--primary-green)',
                      fontWeight: 600,
                      textDecoration: 'none',
                    }}
                  >
                    🎥 {vid.name || 'Inspection Walkthrough'}
                  </a>
                ))}
              </div>
            </div>
          )}
        </div>
      )}

      {/* VOTING & LIVE TALLY SECTION */}
      {isVotingOpen && (
        <div
          style={{
            border: '1px solid var(--border-light)',
            borderRadius: 'var(--radius-md)',
            padding: '18px',
            marginBottom: '18px',
          }}
        >
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '8px', marginBottom: '14px' }}>
            <h4 style={{ fontSize: '0.98rem', fontWeight: 800, color: 'var(--text-dark)', margin: 0 }}>
              🗳️ Live Weighted Community Voting
            </h4>
            <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>
              Total Stake Cast: <strong>{totalWeight.toLocaleString('en-IN')} Votes</strong> ({dispute.voting?.votes?.length || 0} donors)
            </div>
          </div>

          {/* Weighted Progress Bar */}
          <div style={{ marginBottom: '16px' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.82rem', fontWeight: 700, marginBottom: '6px' }}>
              <span style={{ color: 'var(--primary-green)' }}>
                Approve (Resume): {approvePct}% ({approveWeight.toLocaleString('en-IN')} stake)
              </span>
              <span style={{ color: 'var(--danger-red)' }}>
                Reject (Refund): {rejectPct}% ({rejectWeight.toLocaleString('en-IN')} stake)
              </span>
            </div>
            <div style={{ height: '12px', backgroundColor: 'rgba(239, 68, 68, 0.2)', borderRadius: 'var(--radius-full)', overflow: 'hidden', display: 'flex' }}>
              <div
                style={{
                  width: `${approvePct}%`,
                  backgroundColor: 'var(--primary-green)',
                  transition: 'width 0.4s ease',
                }}
              />
              <div
                style={{
                  width: `${rejectPct}%`,
                  backgroundColor: 'var(--danger-red)',
                  transition: 'width 0.4s ease',
                }}
              />
            </div>
          </div>

          {/* Voting Action Box for Eligible Donor */}
          <div
            style={{
              backgroundColor: 'rgba(59, 130, 246, 0.06)',
              border: '1px dashed rgba(59, 130, 246, 0.3)',
              borderRadius: 'var(--radius-sm)',
              padding: '14px',
            }}
          >
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '8px', marginBottom: '12px' }}>
              <div>
                <div style={{ fontSize: '0.82rem', fontWeight: 700, color: 'var(--text-dark)' }}>
                  Your Verified Voting Stake
                </div>
                <div style={{ fontSize: '0.78rem', color: 'var(--text-muted)' }}>
                  {eligibility?.donationAmount > 0 ? (
                    <span>
                      Confirmed donation: <strong>₹{Number(eligibility.donationAmount).toLocaleString('en-IN')}</strong> = <strong>{Number(eligibility.votingPower).toLocaleString('en-IN')} Weighted Votes</strong>
                    </span>
                  ) : (
                    <span>
                      Authenticated Community Member: <strong>5,000 Weighted Demo Votes</strong>
                    </span>
                  )}
                </div>
              </div>

              {eligibility?.hasVoted && (
                <span
                  style={{
                    backgroundColor: eligibility.userVote === 'APPROVE' ? 'rgba(16, 185, 129, 0.15)' : 'rgba(239, 68, 68, 0.15)',
                    color: eligibility.userVote === 'APPROVE' ? 'var(--primary-green)' : 'var(--danger-red)',
                    padding: '4px 10px',
                    borderRadius: 'var(--radius-full)',
                    fontSize: '0.78rem',
                    fontWeight: 800,
                  }}
                >
                  ✓ You Voted: {eligibility.userVote}
                </span>
              )}
            </div>

            <div style={{ display: 'flex', gap: '12px', flexWrap: 'wrap' }}>
              <button
                type="button"
                disabled={voting}
                onClick={() => handleVote('APPROVE')}
                style={{
                  flex: 1,
                  padding: '10px 16px',
                  backgroundColor: 'var(--primary-green)',
                  color: '#ffffff',
                  border: 'none',
                  borderRadius: 'var(--radius-sm)',
                  fontSize: '0.88rem',
                  fontWeight: 700,
                  cursor: voting ? 'wait' : 'pointer',
                  opacity: voting ? 0.75 : 1,
                  boxShadow: 'var(--shadow-sm)',
                }}
              >
                {voting ? 'Casting Vote...' : '✅ Approve Evidence (Resume Campaign)'}
              </button>

              <button
                type="button"
                disabled={voting}
                onClick={() => handleVote('REJECT')}
                style={{
                  flex: 1,
                  padding: '10px 16px',
                  backgroundColor: 'var(--danger-red)',
                  color: '#ffffff',
                  border: 'none',
                  borderRadius: 'var(--radius-sm)',
                  fontSize: '0.88rem',
                  fontWeight: 700,
                  cursor: voting ? 'wait' : 'pointer',
                  opacity: voting ? 0.75 : 1,
                  boxShadow: 'var(--shadow-sm)',
                }}
              >
                {voting ? 'Casting Vote...' : '❌ Reject Evidence (Initiate Refund)'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* REFUND PROCESS DETAILS (If dispute resolved REJECTED) */}
      {dispute.status === 'RESOLVED_REJECTED' && dispute.refunds?.refundRecords?.length > 0 && (
        <div
          style={{
            backgroundColor: 'rgba(239, 68, 68, 0.06)',
            border: '1px solid rgba(239, 68, 68, 0.25)',
            borderRadius: 'var(--radius-md)',
            padding: '16px',
            marginBottom: '16px',
          }}
        >
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '8px' }}>
            <h4 style={{ fontSize: '0.92rem', fontWeight: 800, color: 'var(--danger-red)', margin: 0 }}>
              🔄 Automated On-Chain Refund Ledger
            </h4>
            <span style={{ fontSize: '0.78rem', fontWeight: 700, color: 'var(--danger-red)' }}>
              Total Refunded: ₹{Number(dispute.refunds.totalRefundAmount || 0).toLocaleString('en-IN')}
            </span>
          </div>

          <div style={{ fontSize: '0.82rem', color: 'var(--text-main)', marginBottom: '10px' }}>
            Because the community rejected the beneficiary's evidence by weighted majority, further disbursements were terminated and automatic refunds were broadcasted on Ethereum:
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
            {dispute.refunds.refundRecords.map((rec, idx) => (
              <div
                key={idx}
                style={{
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'center',
                  padding: '8px 12px',
                  backgroundColor: '#ffffff',
                  borderRadius: 'var(--radius-sm)',
                  border: '1px solid rgba(239, 68, 68, 0.15)',
                  fontSize: '0.78rem',
                }}
              >
                <div>
                  <strong>{rec.donorName || 'Verified Donor'}</strong>: ₹{Number(rec.amount || 0).toLocaleString('en-IN')}
                  <div style={{ fontFamily: 'var(--font-mono)', fontSize: '0.72rem', color: 'var(--text-muted)' }}>
                    Payment ID / Tx: {rec.txHash ? `${rec.txHash.substring(0, 14)}...${rec.txHash.substring(rec.txHash.length - 8)}` : 'Razorpay Refund'}
                  </div>
                </div>
                <span className="badge-approved" style={{ fontSize: '0.7rem' }}>
                  ✓ Refund Processed
                </span>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* ADMIN FINALIZATION ACTION */}
      {isVotingOpen && (
        <div style={{ display: 'flex', justifyContent: 'flex-end', alignItems: 'center', paddingTop: '10px', borderTop: '1px solid var(--border-light)' }}>
          <button
            type="button"
            disabled={finalizing}
            onClick={handleFinalize}
            style={{
              padding: '8px 18px',
              backgroundColor: '#1e293b',
              color: '#ffffff',
              border: 'none',
              borderRadius: 'var(--radius-sm)',
              fontSize: '0.82rem',
              fontWeight: 700,
              cursor: finalizing ? 'wait' : 'pointer',
              display: 'inline-flex',
              alignItems: 'center',
              gap: '6px',
            }}
          >
            {finalizing ? 'Finalizing Vote...' : '⚡ Finalize Voting & Enforce Weighted Outcome'}
          </button>
        </div>
      )}
    </div>
  );
}
