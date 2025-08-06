import { useState } from 'react';
import Navbar from '../components/Navbar';
import Footer from '../components/Footer';

const UserDetailsPage = () => {
  const [formData, setFormData] = useState({
    firstName: '',
    lastName: '',
    birthDate: '',
    weight: '',
    height: '',
    goal: '',
  });

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    console.log('Zapisane dane:', formData);
    // TODO: Wyślij do backendu
  };

  return (
    <div className="flex flex-col min-h-screen bg-gray-900 text-white">
      <Navbar />

      <main className="flex-grow py-36 px-4">
        <div className="max-w-2xl mx-auto bg-gray-800 p-8 rounded-xl shadow-lg">
          <h2 className="text-2xl font-bold mb-6">Szczegóły użytkownika</h2>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block mb-1">Imię</label>
              <input
                type="text"
                name="firstName"
                value={formData.firstName}
                onChange={handleChange}
                className="w-full p-2 rounded bg-gray-700 text-white"
              />
            </div>
            <div>
              <label className="block mb-1">Nazwisko</label>
              <input
                type="text"
                name="lastName"
                value={formData.lastName}
                onChange={handleChange}
                className="w-full p-2 rounded bg-gray-700 text-white"
              />
            </div>
            <div>
              <label className="block mb-1">Data urodzenia</label>
              <input
                type="date"
                name="birthDate"
                value={formData.birthDate}
                onChange={handleChange}
                className="w-full p-2 rounded bg-gray-700 text-white"
              />
            </div>
            <div className="flex gap-4">
              <div className="flex-1">
                <label className="block mb-1">Waga (kg)</label>
                <input
                  type="number"
                  name="weight"
                  value={formData.weight}
                  onChange={handleChange}
                  className="w-full p-2 rounded bg-gray-700 text-white"
                />
              </div>
              <div className="flex-1">
                <label className="block mb-1">Wzrost (cm)</label>
                <input
                  type="number"
                  name="height"
                  value={formData.height}
                  onChange={handleChange}
                  className="w-full p-2 rounded bg-gray-700 text-white"
                />
              </div>
            </div>
            <div>
              <label className="block mb-1">Cel biegania</label>
              <select
                name="goal"
                value={formData.goal}
                onChange={handleChange}
                className="w-full p-2 rounded bg-gray-700 text-white"
              >
                <option value="">Wybierz cel</option>
                <option value="czas">Poprawa czasu</option>
                <option value="schudnac">Schudnąć</option>
                <option value="forma">Zbudować formę</option>
              </select>
            </div>
            <button
              type="submit"
              className="mt-4 bg-blue-600 hover:bg-blue-700 px-4 py-2 rounded"
            >
              Zapisz dane
            </button>
          </form>
        </div>
      </main>

      <Footer />
    </div>
  );
};

export default UserDetailsPage;
