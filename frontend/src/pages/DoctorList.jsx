import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import api from '../services/api';

const DoctorList = () => {
  const [doctors, setDoctors] = useState([]);
  const [search, setSearch] = useState('');
  const [department, setDepartment] = useState('');
  const [loading, setLoading] = useState(true);

  const fetchDoctors = async () => {
    setLoading(true);
    const params = {};
    if (search) params.search = search;
    if (department) params.department = department;
    const res = await api.get('/doctors', { params });
    setDoctors(res.data);
    setLoading(false);
  };

  useEffect(() => {
    fetchDoctors();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const handleSearch = (e) => {
    e.preventDefault();
    fetchDoctors();
  };

  const departments = [...new Set(doctors.map((d) => d.department))];

  return (
    <div className="max-w-6xl mx-auto px-4 py-10">
      <h1 className="text-2xl font-bold text-clinical-900 mb-6">Find a Doctor</h1>

      <form onSubmit={handleSearch} className="flex flex-wrap gap-3 mb-8">
        <input
          placeholder="Search by name..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="flex-1 min-w-[200px] border border-clinical-200 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-clinical-400"
        />
        <select
          value={department}
          onChange={(e) => setDepartment(e.target.value)}
          className="border border-clinical-200 rounded-md px-3 py-2"
        >
          <option value="">All departments</option>
          {departments.map((d) => (
            <option key={d} value={d}>
              {d}
            </option>
          ))}
        </select>
        <button
          type="submit"
          className="bg-clinical-600 hover:bg-clinical-700 text-white px-4 py-2 rounded-md font-medium"
        >
          Search
        </button>
      </form>

      {loading ? (
        <p className="text-clinical-600">Loading doctors...</p>
      ) : doctors.length === 0 ? (
        <p className="text-clinical-600">No doctors match that search.</p>
      ) : (
        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-5">
          {doctors.map((doc) => (
            <div key={doc._id} className="bg-white border border-clinical-100 rounded-lg p-5">
              <p className="text-xs font-medium text-clinical-500 uppercase tracking-wide mb-1">
                {doc.department}
              </p>
              <h3 className="font-semibold text-clinical-900">{doc.user?.name}</h3>
              <p className="text-sm text-clinical-600 mb-3">{doc.specialty}</p>
              {doc.bio && <p className="text-sm text-clinical-600 mb-3">{doc.bio}</p>}
              <div className="flex items-center justify-between">
                <span className="text-sm text-clinical-700">
                  {doc.consultationFee > 0 ? `₹${doc.consultationFee} fee` : 'Fee varies'}
                </span>
                <Link
                  to={`/doctors/${doc._id}`}
                  className="text-clinical-700 font-medium text-sm underline"
                >
                  View & book
                </Link>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default DoctorList;
