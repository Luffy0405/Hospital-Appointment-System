import { Link } from 'react-router-dom';

const Home = () => {
  return (
    <div className="max-w-6xl mx-auto px-4 py-16">
      <div className="max-w-2xl">
        <p className="text-clinical-500 font-medium mb-2 tracking-wide uppercase text-sm">
          Book with confidence
        </p>
        <h1 className="text-4xl font-bold text-clinical-900 mb-4">
          See the right specialist, at a time that actually works.
        </h1>
        <p className="text-clinical-700 mb-8">
          Search doctors by department, check real availability, and book an appointment
          in a couple of clicks — no phone calls, no double-booked slots.
        </p>
        <div className="flex gap-3">
          <Link
            to="/doctors"
            className="bg-clinical-600 hover:bg-clinical-700 text-white px-5 py-2.5 rounded-md font-medium"
          >
            Find a Doctor
          </Link>
          <Link
            to="/register"
            className="border border-clinical-300 hover:bg-clinical-100 px-5 py-2.5 rounded-md font-medium"
          >
            Create an account
          </Link>
        </div>
      </div>

      <div className="grid sm:grid-cols-3 gap-6 mt-16">
        {[
          { title: 'Real-time slots', desc: 'See exactly which times are open — updated the moment someone books.' },
          { title: 'One place for your visits', desc: 'Track upcoming and past appointments, and any notes from your doctor.' },
          { title: 'For doctors too', desc: 'Set your weekly availability once and let patients book directly.' },
        ].map((f) => (
          <div key={f.title} className="bg-white border border-clinical-100 rounded-lg p-5">
            <h3 className="font-semibold text-clinical-800 mb-1">{f.title}</h3>
            <p className="text-sm text-clinical-600">{f.desc}</p>
          </div>
        ))}
      </div>
    </div>
  );
};

export default Home;
