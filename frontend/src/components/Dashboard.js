import { useState, useEffect } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';

export default function Dashboard() {
  const [items, setItems] = useState([]);
  const [search, setSearch] = useState('');
  const [form, setForm] = useState({ itemName:'', description:'', type:'Lost', location:'', date:'', contactInfo:'' });
  const [editId, setEditId] = useState(null);
  const navigate = useNavigate();
  const token = localStorage.getItem('token');
  const user = JSON.parse(localStorage.getItem('user'));

  const headers = { Authorization: `Bearer ${token}` };

  const fetchItems = async () => {
    const res = await axios.get('http://localhost:5000/api/items', { headers });
    setItems(res.data);
  };

  useEffect(() => { fetchItems(); }, []);

  const handleSearch = async () => {
    const res = await axios.get(
      `http://localhost:5000/api/items/search?name=${search}`, { headers }
    );
    setItems(res.data);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (editId) {
      await axios.put(`http://localhost:5000/api/items/${editId}`, form, { headers });
      setEditId(null);
    } else {
      await axios.post('http://localhost:5000/api/items', form, { headers });
    }
    setForm({ itemName:'', description:'', type:'Lost', location:'', date:'', contactInfo:'' });
    fetchItems();
  };

  const handleDelete = async (id) => {
    if (window.confirm('Delete this item?')) {
      await axios.delete(`http://localhost:5000/api/items/${id}`, { headers });
      fetchItems();
    }
  };

  const handleEdit = (item) => {
    setEditId(item._id);
    setForm({
      itemName: item.itemName, description: item.description,
      type: item.type, location: item.location,
      date: item.date?.split('T')[0], contactInfo: item.contactInfo
    });
  };

  const logout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    navigate('/');
  };

  return (
    <div className="dashboard">
      <div className="dash-header">
        <h2>Welcome, {user?.name}</h2>
        <button onClick={logout} className="logout-btn">Logout</button>
      </div>

      {/* Add / Edit Form */}
      <div className="card">
        <h3>{editId ? 'Edit Item' : 'Report Item'}</h3>
        <form onSubmit={handleSubmit} className="item-form">
          <input placeholder="Item name" value={form.itemName}
            onChange={e => setForm({...form, itemName: e.target.value})} required />
          <input placeholder="Description" value={form.description}
            onChange={e => setForm({...form, description: e.target.value})} />
          <select value={form.type}
            onChange={e => setForm({...form, type: e.target.value})}>
            <option>Lost</option>
            <option>Found</option>
          </select>
          <input placeholder="Location" value={form.location}
            onChange={e => setForm({...form, location: e.target.value})} required />
          <input type="date" value={form.date}
            onChange={e => setForm({...form, date: e.target.value})} required />
          <input placeholder="Contact info" value={form.contactInfo}
            onChange={e => setForm({...form, contactInfo: e.target.value})} required />
          <button type="submit">{editId ? 'Update' : 'Add Item'}</button>
          {editId && <button type="button" onClick={() => setEditId(null)}>Cancel</button>}
        </form>
      </div>

      {/* Search */}
      <div className="search-bar">
        <input placeholder="Search by name..." value={search}
          onChange={e => setSearch(e.target.value)} />
        <button onClick={handleSearch}>Search</button>
        <button onClick={fetchItems}>Show All</button>
      </div>

      {/* Items List */}
      <div className="items-grid">
        {items.map(item => (
          <div key={item._id} className={`item-card ${item.type === 'Lost' ? 'lost' : 'found'}`}>
            <h4>{item.itemName} <span className="badge">{item.type}</span></h4>
            <p>{item.description}</p>
            <p>📍 {item.location}</p>
            <p>📅 {item.date?.split('T')[0]}</p>
            <p>📞 {item.contactInfo}</p>
            {item.user?._id === user?.id && (
              <div className="actions">
                <button onClick={() => handleEdit(item)}>Edit</button>
                <button onClick={() => handleDelete(item._id)}>Delete</button>
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}