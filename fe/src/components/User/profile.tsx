import { useSelector } from 'react-redux';
import { RootState } from '../../redux/store';
import { Dispatch, SetStateAction} from 'react';

interface HeaderProps {
  selected: string;
  setSelected: Dispatch<SetStateAction<string>>;
}


const Profile = ({ selected, setSelected }: HeaderProps) => {
  // Lấy dữ liệu từ Redux store
  const fullName = useSelector((state: RootState) => state.user.fullName);
  const email = useSelector((state: RootState) => state.user.email);

  return (
    <div>
      <h1>Thông tin người đăng nhập</h1>
      <h3>Họ và tên: {fullName}</h3>
      <h3>Email: {email}</h3>
    </div>
  );
};

export default Profile;
