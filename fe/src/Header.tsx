import './Header.css';
import { useNavigate } from 'react-router-dom';
import { useRef, type Dispatch, type SetStateAction } from 'react';
import { useDispatch, useSelector} from 'react-redux';
import { RootState } from './redux/store';
import { logout } from './redux/reducer+action/userSlice';

interface HeaderProps {
  selected: string;
  setSelected: Dispatch<SetStateAction<string>>; //do đây là hàm của state nên kiểu dữ liệu dùng như này
}
const Header = ({selected, setSelected}: HeaderProps) => {
    const navigate = useNavigate();
    const modalSearchRef = useRef<HTMLDivElement>(null);
    const isLogined = useSelector((state: RootState) => state.user.loggedIn);
    const dispatch = useDispatch(); 
    const handleClick = (e: React.ChangeEvent<HTMLInputElement>) => {
        const id = e.target.id;
        setSelected(id);

        if (id === 'log-out') {
            dispatch(logout()); 
            setSelected('home');
            navigate('/');
            return;
        }
        navigate(id === 'home' ? '/' : '/' + id);
    };

    const handleBrandClick = () => {
        setSelected('home');   
        navigate('/');     
    };

    const handleSearch = () => {
        if (modalSearchRef.current){
            modalSearchRef.current.style.display = modalSearchRef.current.style.display === 'block' ? 'none' : 'block';
        }
    }
    const handleCart = () => {

    }
    return (
        <div className="header-container">
            {/* biểu tượng shop */}
            <div className='symbolize-shop'>
                <div className="cell">
                    <div className="card">
                        <span className="flower-loader">Loading…</span>
                    </div>
                </div>
                <div>
                    <h1 onClick={handleBrandClick} className='brand-name'>AVICI</h1>
                </div>
            </div>

            {/* navigation */}
            <div className="glass-radio-group">
                <input
                    type="radio"
                    onChange={handleClick}
                    name="plan"
                    id="home"
                    checked={selected === 'home'}
                />
                <label htmlFor="home">Home</label>
                    <>
                        <input
                            type="radio"
                            onChange={handleClick}
                            name="plan"
                            id="birthday-flower"
                            checked={selected === 'birthday-flower'}
                        />
                        <label htmlFor="birthday-flower">Birthday</label>

                        <input
                            type="radio"
                            onChange={handleClick}
                            name="plan"
                            id="decorate-flower"
                            checked={selected === 'decorate-flower'}
                        />
                        <label htmlFor="decorate-flower">Decorate</label>

                        <input
                            type="radio"
                            onChange={handleClick}
                            name="plan"
                            id="wedding-flower"
                            checked={selected === 'wedding-flower'}
                        />
                        <label htmlFor="wedding-flower">Wedding</label>
                        
                        <input
                            type="radio"
                            onChange={handleClick}
                            name="plan"
                            id="graduate-flower"
                            checked={selected === 'graduate-flower'}
                        />
                        <label htmlFor="graduate-flower">Graduate</label>

                        <input
                            type="radio"
                            onChange={handleClick}
                            name="plan"
                            id="funeral-flower"
                            checked={selected === 'funeral-flower'}
                        />
                        <label htmlFor="funeral-flower">Funeral</label>
                    </>
                <div className='glass-glider'></div>
            </div>

            {
                isLogined ?
                <>
                    <div className='search-and-cart'>
                        <div className='search'>
                            <button onClick={handleSearch}>
                                <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 640 640"><path d="M480 272C480 317.9 465.1 360.3 440 394.7L566.6 521.4C579.1 533.9 579.1 554.2 566.6 566.7C554.1 579.2 533.8 579.2 521.3 566.7L394.7 440C360.3 465.1 317.9 480 272 480C157.1 480 64 386.9 64 272C64 157.1 157.1 64 272 64C386.9 64 480 157.1 480 272zM272 416C351.5 416 416 351.5 416 272C416 192.5 351.5 128 272 128C192.5 128 128 192.5 128 272C128 351.5 192.5 416 272 416z"/></svg>
                            </button>
                            <div className='modal-search' ref={modalSearchRef}>
                                <input placeholder='Tìm kiếm hoa'>
                                </input>
                                
                            </div>
                        </div>
                        <div className='cart-button'>
                            <button onClick={handleCart}>
                                <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 640 640"><path d="M64 64C46.3 64 32 78.3 32 96C32 113.7 46.3 128 64 128L80 128C88.8 128 96 135.2 96 144L96 432C96 471.8 125.1 504.8 163.1 511C161.1 516.3 160 522 160 528C160 554.5 181.5 576 208 576C234.5 576 256 554.5 256 528C256 522.4 255 517 253.3 512L450.8 512C449 517 448.1 522.4 448.1 528C448.1 554.5 469.6 576 496.1 576C522.6 576 544.1 554.5 544.1 528C544.1 522.4 543.1 517 541.4 512L576.1 512C593.8 512 608.1 497.7 608.1 480C608.1 462.3 593.8 448 576.1 448L176.1 448C167.3 448 160.1 440.8 160.1 432L160.1 144C160 99.8 124.2 64 80 64L64 64zM256 128C229.5 128 208 149.5 208 176L208 352C208 378.5 229.5 400 256 400L496 400C522.5 400 544 378.5 544 352L544 176C544 149.5 522.5 128 496 128L256 128z"/></svg>
                            </button>
                        </div>
                    </div>
                </>
                :
                <></>
            }

            {/* profile + logout */}
            <div className='profile-logout-wrapper'>
                {
                    isLogined ? 
                    <>
                        <div className="radio-inputs">
                            <label className="radio">
                                <input
                                    onChange={handleClick}
                                    name="radio"
                                    type="radio"
                                    id="profile"
                                    checked={selected === 'profile'}
                                />
                                <span className="name profile">Profile</span>
                            </label>
                            <label className="radio">
                                <input
                                    name="radio"
                                    onChange={handleClick}
                                    type="radio"
                                    id="log-out"
                                    checked={selected === 'log-out'}
                                />
                                <span className="name log-out">Log out</span>
                            </label>
                        </div>
                    </>
                    :
                    <>
                        <div className="radio-inputs">
                            <label className="radio">
                                <input
                                    onChange={handleClick}
                                    name="radio"
                                    type="radio"
                                    id="login"
                                    checked={selected === 'login'}
                                />
                                <span className="name profile">Login</span>
                            </label>
                            <label className="radio">
                                <input
                                    name="radio"
                                    onChange={handleClick}
                                    type="radio"
                                    id="register"
                                    checked={selected === 'register'}
                                />
                                <span className="name log-out">Register</span>
                            </label>
                        </div>
                    </>
                }
            </div>
        </div>
    );
};

export default Header;
