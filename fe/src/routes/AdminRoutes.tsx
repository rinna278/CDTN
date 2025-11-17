import { Routes, Route } from "react-router-dom";
import Admin from "../components/Admin/admin";
import AdminControl from "../components/Admin/control";
import ManageProduct from "../components/Admin/manage-product";
import ManageOrder from "../components/Admin/manage-order";
import ManageCustomer from "../components/Admin/manage-customer";
import ReportSummarize from "../components/Admin/report-summarize";
import Settings from "../components/Admin/settings";

const AdminRoutes = () => {
  return (
    <Routes>
        <Route path="/admin" element={<Admin />}>
          <Route path="control" element={<AdminControl/>}/>
          <Route path="manage-product" element={<ManageProduct/>}/>
          <Route path="manage-order" element={<ManageOrder/>}/>
          <Route path="manage-customer" element={<ManageCustomer/>}/>
          <Route path="report-summarize" element={<ReportSummarize/>}/>
          <Route path="settings" element={<Settings/>}/>
        </Route>
    </Routes>
  );
};

export default AdminRoutes;
