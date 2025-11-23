import './App.css';
import { ToastContainer } from 'react-toastify';
import Header from './Header';
import Footer from './Footer';
import UserRoutes from './routes/UserRoutes';
import AdminRoutes from './routes/AdminRoutes';
import { useState } from 'react';

function App() {
  const [selected, setSelected] = useState('');

  return (
    <div className="App">
      <Header selected={selected} setSelected={setSelected} />
      <main>
        {/* Nhóm route cho user */}
        <UserRoutes selected={selected} setSelected={setSelected} />

        {/* Nhóm route cho admin */}
        <AdminRoutes />
      </main>
      <Footer />

      <ToastContainer
        position="top-right"
        autoClose={3000}
        hideProgressBar={false}
        pauseOnHover
        theme="colored"
        style={{marginTop: '60px'}}
      />
    </div>
  );
}

export default App;
