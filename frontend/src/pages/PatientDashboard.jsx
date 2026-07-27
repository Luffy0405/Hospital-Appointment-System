import { useEffect, useState } from 'react';
import api from '../services/api';

const statusColor = {
  booked: 'bg-clinical-100 text-clinical-700',
  completed: 'bg-clinical-200 text-clinical-800',
  cancelled: 'bg-red-100 text-red-700',
  'no-show': 'bg-yellow-100 text-yellow-700',
};

const PatientDashboard = () => {
  const [appointments, setAppointments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [cancellingId, setCancellingId] = useState(null);

  const load = async () => {
    setLoading(true);
    const res = await api.get('/appointments/mine');
    setAppointments(res.data);
    setLoading(false);
  };

  useEffect(() => {
    load();
  }, []);

  const handleCancel = async (id) => {
    setCancellingId(id);
    try {
      await api.put(`/appointments/${id}/cancel`);
      await load();
    } finally {
      setCancellingId(null);
    }
  };

  const now = new Date();
  const upcoming = appointments.filter((a) => new Date(a.slotStart) >= now && a.status === 'booked');
  const past = appointments.filter((a) => new Date(a.slotStart) < now || a.status !== 'booked');

  const renderCard = (a) => (
    <div key={a._id} className="bg-white border border-clinical-100 rounded-lg p-5 flex items-center justify-between">
      <div>
        <p className="font-semibold text-clinical-900">{a.doctor?.user?.name}</p>
        <p className="text-sm text-clinical-600">{a.doctor?.specialty}</p>
        <p className="text-sm text-clinical-700 mt-1">
          {new Date(a.slotStart).toLocaleString([], {
            dateStyle: 'medium',
            timeStyle: 'short',
          })}
        </p>
        {a.reason && <p className="text-sm text-clinical-500 mt-1">Reason: {a.reason}</p>}
        {a.notes && <p className="text-sm text-clinical-500 mt-1">Doctor's notes: {a.notes}</p>}
      </div>
      <div className="flex flex-col items-end gap-2">
        <span className={`text-xs font-medium px-2 py-1 rounded-full ${statusColor[a.status]}`}>
          {a.status}
        </span>
        {a.status === 'booked' && new Date(a.slotStart) >= now && (
          <button
            onClick={() => handleCancel(a._id)}
            disabled={cancellingId === a._id}
            className="text-alert-500 text-sm underline disabled:opacity-50"
          >
            {cancellingId === a._id ? 'Cancelling...' : 'Cancel'}
          </button>
        )}
      </div>
    </div>
  );

  return (
    <div className="max-w-4xl mx-auto px-4 py-10">
      <h1 className="text-2xl font-bold text-clinical-900 mb-6">Your Appointments</h1>

      {loading ? (
        <p className="text-clinical-600">Loading...</p>
      ) : (
        <>
          <h2 className="font-semibold text-clinical-800 mb-3">Upcoming</h2>
          <div className="space-y-3 mb-8">
            {upcoming.length === 0 ? (
              <p className="text-clinical-600 text-sm">No upcoming appointments.</p>
            ) : (
              upcoming.map(renderCard)
            )}
          </div>

          <h2 className="font-semibold text-clinical-800 mb-3">Past & cancelled</h2>
          <div className="space-y-3">
            {past.length === 0 ? (
              <p className="text-clinical-600 text-sm">Nothing here yet.</p>
            ) : (
              past.map(renderCard)
            )}
          </div>
        </>
      )}
    </div>
  );
};

export default PatientDashboard;
