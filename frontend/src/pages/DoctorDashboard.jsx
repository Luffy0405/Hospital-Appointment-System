import { useEffect, useState } from 'react';
import api from '../services/api';

const DAYS = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];

const DoctorDashboard = () => {
  const [appointments, setAppointments] = useState([]);
  const [profile, setProfile] = useState(null);
  const [loading, setLoading] = useState(true);
  const [notesDraft, setNotesDraft] = useState({});
  const [savingId, setSavingId] = useState(null);
  const [availability, setAvailability] = useState([]);
  const [savingAvailability, setSavingAvailability] = useState(false);

  const load = async () => {
    setLoading(true);
    const [apptRes, profileRes] = await Promise.all([
      api.get('/appointments/doctor-schedule'),
      api.get('/doctors/me/profile'),
    ]);
    setAppointments(apptRes.data);
    setProfile(profileRes.data);
    setAvailability(profileRes.data.availability || []);
    setLoading(false);
  };

  useEffect(() => {
    load();
  }, []);

  const handleComplete = async (id) => {
    setSavingId(id);
    try {
      await api.put(`/appointments/${id}/complete`, { notes: notesDraft[id] || '' });
      await load();
    } finally {
      setSavingId(null);
    }
  };

  const handleCancel = async (id) => {
    setSavingId(id);
    try {
      await api.put(`/appointments/${id}/cancel`);
      await load();
    } finally {
      setSavingId(null);
    }
  };

  const addAvailabilityRow = () => {
    setAvailability([
      ...availability,
      { dayOfWeek: 1, startTime: '09:00', endTime: '13:00', slotDurationMinutes: 30 },
    ]);
  };

  const updateRow = (idx, field, value) => {
    const next = [...availability];
    next[idx] = { ...next[idx], [field]: field === 'dayOfWeek' || field === 'slotDurationMinutes' ? Number(value) : value };
    setAvailability(next);
  };

  const removeRow = (idx) => {
    setAvailability(availability.filter((_, i) => i !== idx));
  };

  const saveAvailability = async () => {
    setSavingAvailability(true);
    try {
      await api.put('/doctors/me/availability', { availability });
    } finally {
      setSavingAvailability(false);
    }
  };

  if (loading) return <p className="text-center py-16 text-clinical-600">Loading...</p>;

  const now = new Date();
  const upcoming = appointments.filter((a) => a.status === 'booked' && new Date(a.slotStart) >= now);

  return (
    <div className="max-w-4xl mx-auto px-4 py-10">
      <h1 className="text-2xl font-bold text-clinical-900 mb-1">Doctor Dashboard</h1>
      <p className="text-clinical-600 mb-8">
        {profile?.specialty} — {profile?.department}
      </p>

      <section className="mb-10">
        <h2 className="font-semibold text-clinical-800 mb-3">Upcoming appointments</h2>
        {upcoming.length === 0 ? (
          <p className="text-clinical-600 text-sm">No upcoming appointments.</p>
        ) : (
          <div className="space-y-3">
            {upcoming.map((a) => (
              <div key={a._id} className="bg-white border border-clinical-100 rounded-lg p-5">
                <div className="flex items-center justify-between mb-2">
                  <div>
                    <p className="font-semibold text-clinical-900">{a.patient?.name}</p>
                    <p className="text-sm text-clinical-600">
                      {new Date(a.slotStart).toLocaleString([], { dateStyle: 'medium', timeStyle: 'short' })}
                    </p>
                    {a.reason && <p className="text-sm text-clinical-500 mt-1">Reason: {a.reason}</p>}
                  </div>
                  <button
                    onClick={() => handleCancel(a._id)}
                    disabled={savingId === a._id}
                    className="text-alert-500 text-sm underline disabled:opacity-50"
                  >
                    Cancel
                  </button>
                </div>
                <textarea
                  placeholder="Add visit notes before marking complete..."
                  value={notesDraft[a._id] ?? ''}
                  onChange={(e) => setNotesDraft({ ...notesDraft, [a._id]: e.target.value })}
                  rows={2}
                  className="w-full border border-clinical-200 rounded-md px-3 py-2 text-sm mb-2 focus:outline-none focus:ring-2 focus:ring-clinical-400"
                />
                <button
                  onClick={() => handleComplete(a._id)}
                  disabled={savingId === a._id}
                  className="bg-clinical-600 hover:bg-clinical-700 text-white px-4 py-1.5 rounded-md text-sm font-medium disabled:opacity-50"
                >
                  {savingId === a._id ? 'Saving...' : 'Mark completed'}
                </button>
              </div>
            ))}
          </div>
        )}
      </section>

      <section>
        <h2 className="font-semibold text-clinical-800 mb-3">Weekly availability</h2>
        <div className="bg-white border border-clinical-100 rounded-lg p-5">
          {availability.length === 0 && (
            <p className="text-clinical-600 text-sm mb-3">
              You haven't set any availability yet — patients can't book you until you do.
            </p>
          )}
          <div className="space-y-3 mb-4">
            {availability.map((row, idx) => (
              <div key={idx} className="flex flex-wrap items-center gap-2">
                <select
                  value={row.dayOfWeek}
                  onChange={(e) => updateRow(idx, 'dayOfWeek', e.target.value)}
                  className="border border-clinical-200 rounded-md px-2 py-1.5 text-sm"
                >
                  {DAYS.map((d, i) => (
                    <option key={i} value={i}>
                      {d}
                    </option>
                  ))}
                </select>
                <input
                  type="time"
                  value={row.startTime}
                  onChange={(e) => updateRow(idx, 'startTime', e.target.value)}
                  className="border border-clinical-200 rounded-md px-2 py-1.5 text-sm"
                />
                <span className="text-clinical-500 text-sm">to</span>
                <input
                  type="time"
                  value={row.endTime}
                  onChange={(e) => updateRow(idx, 'endTime', e.target.value)}
                  className="border border-clinical-200 rounded-md px-2 py-1.5 text-sm"
                />
                <select
                  value={row.slotDurationMinutes}
                  onChange={(e) => updateRow(idx, 'slotDurationMinutes', e.target.value)}
                  className="border border-clinical-200 rounded-md px-2 py-1.5 text-sm"
                >
                  {[15, 20, 30, 45, 60].map((m) => (
                    <option key={m} value={m}>
                      {m} min slots
                    </option>
                  ))}
                </select>
                <button onClick={() => removeRow(idx)} className="text-alert-500 text-sm underline">
                  Remove
                </button>
              </div>
            ))}
          </div>
          <div className="flex gap-3">
            <button
              onClick={addAvailabilityRow}
              className="border border-clinical-300 text-clinical-700 px-4 py-2 rounded-md text-sm font-medium"
            >
              + Add time block
            </button>
            <button
              onClick={saveAvailability}
              disabled={savingAvailability}
              className="bg-clinical-600 hover:bg-clinical-700 text-white px-4 py-2 rounded-md text-sm font-medium disabled:opacity-50"
            >
              {savingAvailability ? 'Saving...' : 'Save availability'}
            </button>
          </div>
        </div>
      </section>
    </div>
  );
};

export default DoctorDashboard;
