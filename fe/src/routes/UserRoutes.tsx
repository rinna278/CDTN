import { Routes, Route } from "react-router-dom";
import { Dispatch, SetStateAction } from "react";

import HomePage from "../components/User/hompage";
import BirthdayFlower from "../components/Flower/birthday-flower";
import DecorateFlower from "../components/Flower/decorate-flower";
import WeddingFlower from "../components/Flower/wedding-flower";
import GraduateFlower from "../components/Flower/graduate-flower";
import FuneralFlower from "../components/Flower/funeral-flower";
import Register from "../components/User/register";
import Login from "../components/User/login";
import Profile from "../components/User/profile";
import Cart from "../components/Cart/cart";
import ForgotPassword from "../components/User/forgot-password";
import DetailProduct from "../components/Flower/detail-product";
import Orders from "../components/Order/orders";
import OrderDetail from "../components/Order/order-detail";
import VNPAY_CALLBACK from "../components/Order/vnpay_callback";
interface UserRoutesProps {
  selected: string;
  setSelected: Dispatch<SetStateAction<string>>;
}

const UserRoutes = ({ selected, setSelected }: UserRoutesProps) => {
  return (
    <Routes>
      <Route path="/" element={<HomePage />}>
        <Route path="birthday-flower" element={<BirthdayFlower />} />
        <Route path="decorate-flower" element={<DecorateFlower />} />
        <Route path="wedding-flower" element={<WeddingFlower />} />
        <Route path="graduate-flower" element={<GraduateFlower />} />
        <Route path="funeral-flower" element={<FuneralFlower />} />
      </Route>
      <Route
        path="/register"
        element={<Register selected={selected} setSelected={setSelected} />}
      />
      <Route
        path="/login"
        element={<Login selected={selected} setSelected={setSelected} />}
      />
      <Route
        path="/profile"
        element={<Profile selected={selected} setSelected={setSelected} />}
      />
      <Route
        path="/cart"
        element={<Cart/>}
      />
      <Route
        path="/forgot-password"
        element={
          <ForgotPassword selected={selected} setSelected={setSelected} />
        }
      />
      <Route
        path="/detail-product/:productID"
        element={
          <DetailProduct selected={selected} setSelected={setSelected} />
        }
      />
      <Route
        path="/my-orders"
        element={<Orders selected={selected} setSelected={setSelected} />}
      />
      <Route path="/orders/:orderId" element={<OrderDetail />} />
      <Route path="/order/payment-callback" element={<VNPAY_CALLBACK />} />
    </Routes>
  );
};

export default UserRoutes;
