import "./App.css";
import { ToastContainer } from "react-toastify";
import Header from "./Header";
import Footer from "./Footer";
import UserRoutes from "./routes/UserRoutes";
import AdminRoutes from "./routes/AdminRoutes";
import { useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { RootState } from "./redux/store";
import { getInfo } from "./services/apiService";
import { setUserInfo, logout } from "./redux/reducer+action/userSlice";
// ✅ Import AOS
import AOS from 'aos';
import 'aos/dist/aos.css';

function App() {
  const [selected, setSelected] = useState("");

  const dispatch = useDispatch();
  const accessToken = useSelector((state: RootState) => state.user.accessToken);

  // ✅ Khởi tạo AOS (chạy 1 lần khi app mount)
  useEffect(() => {
    AOS.init({
      duration: 1500, // Thời gian animation (ms)
      easing: "ease-in-out", // Kiểu chuyển động
      once: false, // Chỉ animate 1 lần
      offset: 120, // Khoảng cách trigger (px)
    });
  }, []);

  // ✅ GỌI getInfo 1 LẦN DUY NHẤT
  useEffect(() => {
    if (!accessToken) return;

    const fetchUserInfo = async () => {
      try {
        const res = await getInfo();

        dispatch(
          setUserInfo({
            fullName: res.data.name,
            email: res.data.email,
            role: res.data.role?.name, // 👈 ADMIN / USER
          })
        );
      } catch (error) {
        dispatch(logout());
      }
    };

    fetchUserInfo();
  }, [accessToken, dispatch]);

  return (
    <div className="App">
      <Header selected={selected} setSelected={setSelected} />

      <main>
        <UserRoutes selected={selected} setSelected={setSelected} />
        <AdminRoutes />
      </main>

      <Footer />

      <ToastContainer
        position="top-right"
        autoClose={3000}
        hideProgressBar={false}
        pauseOnHover
        theme="colored"
        style={{ marginTop: "60px" }}
      />
    </div>
  );
}

export default App;
