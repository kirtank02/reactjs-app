import DetailsCardComponent from "./components/DetailsCardComponent";
import { useState, useEffect } from 'react';
import axios from 'axios';

function App() {
  const [formData, setFormData] = useState({ name: "", email: "" });
  const [recordData, setRecordData] = useState([]);

  const base_url = process.env.REACT_APP_NODE_ENV === 'development'
    ? process.env.REACT_APP_LOCAL_BASE_URL
    : process.env.REACT_APP_SERVER_BASE_URL;

  useEffect(() => {
    axios.get(`${base_url}/getUsers`)
      .then(res => setRecordData(res.data))
      .catch(err => alert(`Some error occurred ==> ${err}`));
  }, []);

  const handleChange = (event) => {
    const { name, value } = event.target;
    setFormData((prevFormData) => ({ ...prevFormData, [name]: value }));
  };

  const handleSubmit = async (event) => {
    event.preventDefault();
    axios.post(`${base_url}/addUser`, formData)
      .then(() => {
        setFormData({ name: "", email: "" });
        alert("User created successfully");
        return axios.get(`${base_url}/getUsers`);
      })
      .then(res => setRecordData(res.data))
      .catch(err => alert(`Some error occurred ==> ${err}`));
  };

  return (
    <div className="min-h-screen bg-gradient-to-r from-blue-50 to-blue-100 font-sans">
      <nav className="bg-white shadow-md px-6 py-4 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <img src="https://cdn-icons-png.flaticon.com/512/3657/3657448.png" width="40" alt="logo" />
          <span className="text-2xl font-bold text-blue-600">Cloud Project</span>
        </div>
      </nav>

      <div className="container mx-auto px-4 py-8">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          
          {/* Users List */}
          <div>
            <h3 className="text-xl font-semibold text-center mb-4 text-blue-800">Users List</h3>
            <div className="space-y-4">
              {recordData.map((r, i) => (
                <div key={i} className="bg-white p-4 rounded-xl shadow-md border border-blue-100">
                  <DetailsCardComponent email={r.email} sn={i + 1} userN={r.name} />
                </div>
              ))}
            </div>
          </div>

          {/* Add User Form */}
          <div className="bg-white rounded-xl p-6 shadow-lg border border-blue-100">
            <h2 className="text-xl font-semibold mb-6 text-blue-800">Add User</h2>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label htmlFor="name" className="block mb-1 font-medium text-gray-700">User Name</label>
                <input
                  type="text"
                  name="name"
                  id="name"
                  value={formData.name}
                  onChange={handleChange}
                  placeholder="Enter user name"
                  className="w-full border border-gray-300 rounded-md px-3 py-2 focus:ring focus:ring-blue-200"
                  required
                />
              </div>
              <div>
                <label htmlFor="email" className="block mb-1 font-medium text-gray-700">Email</label>
                <input
                  type="email"
                  name="email"
                  id="email"
                  value={formData.email}
                  onChange={handleChange}
                  placeholder="Enter email"
                  className="w-full border border-gray-300 rounded-md px-3 py-2 focus:ring focus:ring-blue-200"
                  required
                />
              </div>
              <button
                type="submit"
                className="w-full bg-blue-600 text-white py-2 rounded-md hover:bg-blue-700 transition duration-200"
              >
                Add User
              </button>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
}

export default App;
