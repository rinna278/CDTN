import './App.css';
import { useState } from 'react';
import {Routes, Route} from 'react-router-dom';
import {ToastContainer} from 'react-toastify';
import Login from './components/User/login';
import Header from './Header';
import Footer from './Footer';
import HomePage from './components/User/hompage';
import Register from './components/User/register';
import BirthdayFlower from './components/Flower/birthday-flower';
import DecorateFlower from './components/Flower/decorate-flower';
import WeddingFlower from './components/Flower/wedding-flower';
import GraduateFlower from './components/Flower/graduate-flower';
import FuneralFlower from './components/Flower/funeral-flower';
function App() {
  const [selected, setSelected] = useState('');
  return (
    <div className="App">
      <Header selected={selected} setSelected={setSelected} />
      <main>
        <Routes>
          <Route path='/register' element={<Register selected={selected} setSelected={setSelected}/>}/>
          <Route path='/' element={<HomePage/>}>
            <Route path='birthday-flower' element={<BirthdayFlower/>}/>
            <Route path='decorate-flower' element={<DecorateFlower/>}/>
            <Route path='wedding-flower' element={<WeddingFlower/>}/>
            <Route path='graduate-flower' element={<GraduateFlower/>}/>
            <Route path='funeral-flower' element={<FuneralFlower/>}/>
          </Route>
          <Route path='/login' element={<Login selected={selected} setSelected={setSelected}/>}/>
        </Routes>
      </main>
      <ToastContainer
        position="top-right" // Vị trí (có thể thay đổi)
        autoClose={3000}     // Thời gian tự đóng (3 giây)
        hideProgressBar={false}
        newestOnTop={false}
        closeOnClick
        rtl={false}
        pauseOnFocusLoss
        draggable
        pauseOnHover
        theme="colored" // Chủ đề màu sắc (có thể là "light" hoặc "dark")
      />
      <Footer/>
    </div>
  );
}

export default App;
