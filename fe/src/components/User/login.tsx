import { Link, useNavigate } from 'react-router-dom';
import './login.css';
import { Dispatch, SetStateAction, useState } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { RootState, AppDispatch } from '../../redux/store';
import { loginSuccess, loginFailure } from '../../redux/reducer+action/userSlice';
import {postLogin} from '../../services/apiService'
import { toast } from 'react-toastify';


interface HeaderProps {
  selected: string;
  setSelected: Dispatch<SetStateAction<string>>;
}

const Login = ({ selected, setSelected }: HeaderProps) => {
  const navigate = useNavigate();
  const dispatch = useDispatch<AppDispatch>();
  const isLogined = useSelector((state: RootState) => state.user.loggedIn);

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');

  const handleSignUp = () => {
    setSelected('register');
  };
  const validateEmail = (email : string) => {
    return String(email)
        .toLowerCase()
        .match(
            /^(([^<>()[\]\\.,;:\s@"]+(\.[^<>()[\]\\.,;:\s@"]+)*)|.(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/
    );
  };  
  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setErrorMsg('');
    const isValidEmail = validateEmail(email);
    if (!isValidEmail){
        toast.error('Invalid email');
        return;
    }
    if (!password){
        toast.error('Invalid password');
        return;
    }
    setLoading(true);
    try {
      const response = await postLogin(email,password);
      // Gọi Redux action loginSuccess
      dispatch(
        loginSuccess({
          fullName: response.data.fullName,
          email: response.data.email,
          accessToken: response.data.accessToken,
          isFirstTimeLogin: response.data.isFirstTimeLogin,
        })
      );
      toast.success('Đăng nhập thành công');
      navigate('/', { replace: true });
    } catch (error: any) {
      const msg = error.response?.data?.message || 'Login failed';
      setErrorMsg(msg);
      dispatch(loginFailure(msg));
    } finally {
      setLoading(false);
    }
  };

  // Nếu đã login, không render trang login
  if (isLogined) return null;

  return (
    <div className="login-container">
      <div className="form-container">
        <p className="title">Login</p>
        <form className="form" onSubmit={handleLogin}>
          <div className="input-group">
            <label htmlFor="email">Email</label>
            <input
              type="text"
              name="email"
              id="email"
              placeholder=""
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
            />
          </div>
          <div className="input-group">
            <label htmlFor="password">Password</label>
            <input
              type="password"
              name="password"
              id="password"
              placeholder=""
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
            />
            <div className="forgot">
              <a rel="noopener noreferrer" href="/forgot-password">
                Forgot Password ?
              </a>
            </div>
          </div>
          {errorMsg && <p style={{ color: 'red' }}>{errorMsg}</p>}
          <button className="sign" type="submit" disabled={loading}>
            {loading ? 'Logging in...' : 'Sign in'}
          </button>
        </form>

        <div className="social-message">
          <div className="line"></div>
          <p className="message">Login with social accounts</p>
          <div className="line"></div>
        </div>
        <div className="social-icons">
          {/* Các button social */}
        </div>
        <p className="signup">
          Don't have an account?
          <Link rel="noopener noreferrer" to="/register" onClick={handleSignUp}>
            Sign up
          </Link>
        </p>
      </div>
    </div>
  );
};

export default Login;
