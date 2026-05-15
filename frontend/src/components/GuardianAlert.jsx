import { useApp } from '../context/AppContext';

export default function GuardianAlertModal() {
  const { guardianAlert, dismissGuardianAlert } = useApp();

  if (!guardianAlert) return null;

  return (
    <div className="modal-overlay" onClick={dismissGuardianAlert}>
      <div
        className="guardian-modal"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="guardian-modal__icon">🔔</div>
        <h2 className="guardian-modal__title">Guardian Alert</h2>
        <p className="guardian-modal__body">{guardianAlert.message}</p>
        <p className="guardian-modal__sub">
          Ek alert aapke registered family member ko bhej diya gaya hai.
        </p>
        <div className="guardian-modal__actions">
          <button className="btn btn--danger" onClick={dismissGuardianAlert}>
            Samajh Gaya (Dismiss)
          </button>
        </div>
      </div>
    </div>
  );
}
