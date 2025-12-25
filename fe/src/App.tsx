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

function App() {
  const [selected, setSelected] = useState("");

  const dispatch = useDispatch();
  const accessToken = useSelector((state: RootState) => state.user.accessToken);

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
