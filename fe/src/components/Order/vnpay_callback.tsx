import { useEffect, useRef } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { getvnpayCallback } from "../../services/apiService";
import { toast } from "react-toastify";

const VNPAY_CALLBACK = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const calledRef = useRef(false);

  useEffect(() => {
    if (calledRef.current) return;
    calledRef.current = true;
    const queryString = location.search;
    const fetchData = async () => {
      try {
        const response = await getvnpayCallback(queryString);
        console.log("dữ liệu trả về: ", response);
        if (response.status === 200) {
          toast.success("Thanh toán thành công");
          navigate("/profile?tab=orders");
          
        }
      } catch (err) {
        console.log(err);
        toast.error("THanh toán ko thành công");
      }
    };
    fetchData();
  }, [location.search]);

  return(
    <></>
  ) 
};

export default VNPAY_CALLBACK;
