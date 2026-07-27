import { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import api from '../services/api';
import { useAuth } from '../context/AuthContext';

const toDateInputValue = (date) => date.toISOString().split('T')[0];

const DoctorDetail = () => {
  const { id } = useParams();
  const { user } = useAuth();
  const navigate = useNavigate();

  const [doctor, setDoctor] = useState(null);
  const [selectedDate, setSelectedDate] = useState(toDateInputValue(new Date()));
  const [slots, setSlots] = useState([]);
  const [loadingSlots, setLoadingSlots] = useState(false);
  const [reason, setReason] = useState('');
  const [selectedSlot, setSelectedSlot] = useState(null);
  const [message, setMessage] = useState('');
  const [booking, setBooking] = useState(false);

  useEffect(() => {
    api.get(`/doctors/${id}`).then((res) => setDoctor(res.data));
  }, [id]);

  const fetchSlots = async (date) => {
    setLoadingSlots(true);
    setSelectedSlot(null);
    try {
      const res = await api.get(`/doctors/${id}/slots`, { params: { date } });
      setSlots(res.data.slots);
    } finally {
      setLoadingSlots(false);
    }
  };

  useEffect(() => {
    fetchSlots(selectedDate);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [id, selectedDate]);

  const handleBook = async () => {
    if (!user) {
      navigate('/login');
      return;
    }
    if (!selectedSlot) return;
    setBooking(true);
    setMessage('');
    try {
      await api.post('/appointments', {
        doctorId: id,
        slotStart: selectedSlot.slotStart,
        slotEnd: selectedSlot.slotEnd,
        reason,
      });
      setMessage('success');
      fetchSlots(selectedDate); // refresh so the booked slot disappears
      setReason('');
    } catch (err) {
      setMessage(err.response?.data?.message || 'Booking failed. Please try another slot.');
    } finally {
      setBooking(false);
    }
  };

  if (!doctor) {
    return <p className="text-center py-16 text-clinical-600">Loading...</p>;
  }

  return (
    <div className="max-w-4xl mx-auto px-4 py-10">
      <div className="bg-white border border-clinical-100 rounded-lg p-6 mb-8">
        <p className="text-xs font-medium text-clinical-500 uppercase tracking-wide mb-1">
          {doctor.department}
        </p>
        <h1 className="text-2xl font-bold text-clinical-900">{doctor.user?.name}</h1>
        <p className="text-clinical-600 mb-2">{doctor.specialty}</p>
        {doctor.bio && <p className="text-sm text-clinical-600">{doctor.bio}</p>}
        {doctor.consultationFee > 0 && (
          <p className="text-sm text-clinical-700 mt-2 font-medium">₹{doctor.consultationFee} consultation fee</p>
        )}
      </div>

      <div className="bg-white border border-clinical-100 rounded-lg p-6">
        <h2 className="font-semibold text-clinical-900 mb-4">Book an appointment</h2>

        <label className="block text-sm font-medium text-clinical-700 mb-1">Choose a date</label>
        <input
          type="date"
          min={toDateInputValue(new Date())}
          value={selectedDate}
          onChange={(e) => setSelectedDate(e.target.value)}
          className="border border-clinical-200 rounded-md px-3 py-2 mb-5"
        />

        {loadingSlots ? (
          <p className="text-clinical-600 text-sm">Loading available slots...</p>
        ) : slots.length === 0 ? (
          <p className="text-clinical-600 text-sm">No open slots on this date. Try another day.</p>
        ) : (
          <div className="grid grid-cols-3 sm:grid-cols-4 gap-2 mb-5">
            {slots.map((s) => {
              const label = new Date(s.slotStart).toLocaleTimeString([], {
                hour: '2-digit',
                minute: '2-digit',
              });
              const isSelected = selectedSlot?.slotStart === s.slotStart;
              return (
                <button
                  key={s.slotStart}
                  onClick={() => setSelectedSlot(s)}
                  className={`py-2 rounded-md text-sm font-medium border ${
                    isSelected
                      ? 'bg-clinical-600 text-white border-clinical-600'
                      : 'border-clinical-200 text-clinical-700 hover:bg-clinical-50'
                  }`}
                >
                  {label}
                </button>
              );
            })}
          </div>
        )}

        {selectedSlot && (
          <div className="mb-5">
            <label className="block text-sm font-medium text-clinical-700 mb-1">
              Reason for visit (optional)
            </label>
            <textarea
              value={reason}
              onChange={(e) => setReason(e.target.value)}
              rows={3}
              className="w-full border border-clinical-200 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-clinical-400"
            />
          </div>
        )}

        {message === 'success' && (
          <p className="text-clinical-600 text-sm mb-3">
            Appointment booked. You can view it from your dashboard.
          </p>
        )}
        {message && message !== 'success' && (
          <p className="text-alert-500 text-sm mb-3">{message}</p>
        )}

        <button
          disabled={!selectedSlot || booking}
          onClick={handleBook}
          className="bg-clinical-600 hover:bg-clinical-700 text-white px-5 py-2.5 rounded-md font-medium disabled:opacity-50"
        >
          {booking ? 'Booking...' : user ? 'Confirm booking' : 'Log in to book'}
        </button>
      </div>
    </div>
  );
};

export default DoctorDetail;
