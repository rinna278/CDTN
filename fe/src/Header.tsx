import "./Header.css";
import { useNavigate, useLocation } from "react-router-dom";
import {
  useRef,
  useEffect,
  type Dispatch,
  type SetStateAction,
  useState,
} from "react";
import { useDispatch, useSelector } from "react-redux";
import { RootState } from "./redux/store";
import { logout } from "./redux/reducer+action/userSlice";
import { useSearch } from "./components/context/SearchContext";

interface HeaderProps {
  selected: string;
  setSelected: Dispatch<SetStateAction<string>>;
}

const Header = ({ selected, setSelected }: HeaderProps) => {
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const isLogined = useSelector((state: RootState) => state.user.loggedIn);
  const location = useLocation();
  const isAdminPage = location.pathname.startsWith("/admin");
  const [isSearching, setIsSearching] = useState(false);
  const searchRef = useRef<HTMLDivElement>(null);
  //query để search theo điều kiện
  const {searchQuery, setSearchQuery, clearSearch} = useSearch();
  //query ở page hiện tại
  const [localQuery, setLocalQuery] = useState('');
  //lấy số lượng item trong giỏ từ redux
  const totalCartItems = useSelector((state: RootState) => state.cart.totalItems);

  //hàm xử lí khi ấn enter để search
  const handleSearchSubmit = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter'){
      setSearchQuery(localQuery);
      setIsSearching(true);
    }
  }

  //hàm xử lí đóng nút search
  const handleSearchClose = () => {
    setIsSearching(false);
    setLocalQuery('');
    clearSearch();
  }



  const roleName = useSelector((state: RootState) => state.user.role);
  const isAdmin = roleName === "Administrator";

  useEffect(() => {
    const routeId =
      location.pathname === "/" ? "home" : location.pathname.slice(1);
    setSelected(routeId);
  }, [location.pathname, setSelected]);

  const handleClick = (e: React.ChangeEvent<HTMLInputElement>) => {
    const id = e.target.id;
    setSelected(id);

    if (id === "log-out") {
      dispatch(logout());
      setSelected("home");
      navigate("/");
      return;
    }
    navigate(id === "home" ? "/" : "/" + id);
  };

  const handleBrandClick = () => {
    setSelected("home");
    navigate("/");
  };

  const searchButtonRef = useRef<HTMLButtonElement>(null);

  useEffect(() => {
    if (!isSearching) return;

    const handleClickOutside = (e: MouseEvent) => {
      const target = e.target as Node;
      if (
        searchRef.current &&
        !searchRef.current.contains(target) &&
        searchButtonRef.current &&
        !searchButtonRef.current.contains(target)
      ) {
        setIsSearching(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, [isSearching]);

  const handleSearch = () => {
    setIsSearching((prev) => !prev);
  };

  const handleCart = () => {
    navigate("/cart");
  };

  return (
    <div className="header-container">
      <div className="section-1">
        {isLogined && isAdmin ? (
          <>
            {/* Nút chuyển admin user */}
            <div className="tooltip-wrapper">
              <ul className="tooltip-container">
                <li
                  style={{ "--i": "1.1s" } as React.CSSProperties}
                  className="nav-link"
                >
                  <div className="tooltip-tab">
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      viewBox="0 0 640 640"
                    >
                      <path d="M96 160C96 142.3 110.3 128 128 128L512 128C529.7 128 544 142.3 544 160C544 177.7 529.7 192 512 192L128 192C110.3 192 96 177.7 96 160zM96 320C96 302.3 110.3 288 128 288L512 288C529.7 288 544 302.3 544 320C544 337.7 529.7 352 512 352L128 352C110.3 352 96 337.7 96 320zM544 480C544 497.7 529.7 512 512 512L128 512C110.3 512 96 497.7 96 480C96 462.3 110.3 448 128 448L512 448C529.7 448 544 462.3 544 480z" />
                    </svg>
                  </div>
                  <div className="tooltip">
                    <ul className="tooltip-menu-with-icon">
                      <li className="tooltip-link">
                        <a
                          className="tooltip-links admin"
                          href="/admin/control"
                        >
                          <svg
                            xmlns="http://www.w3.org/2000/svg"
                            viewBox="0 0 640 640"
                          >
                            <path d="M102.8 57.3C108.2 51.9 116.6 51.1 123 55.3L241.9 134.5C250.8 140.4 256.1 150.4 256.1 161.1L256.1 210.7L346.9 301.5C380.2 286.5 420.8 292.6 448.1 320L574.2 446.1C592.9 464.8 592.9 495.2 574.2 514L514.1 574.1C495.4 592.8 465 592.8 446.2 574.1L320.1 448C292.7 420.6 286.6 380.1 301.6 346.8L210.8 256L161.2 256C150.5 256 140.5 250.7 134.6 241.8L55.4 122.9C51.2 116.6 52 108.1 57.4 102.7L102.8 57.3zM247.8 360.8C241.5 397.7 250.1 436.7 274 468L179.1 563C151 591.1 105.4 591.1 77.3 563C49.2 534.9 49.2 489.3 77.3 461.2L212.7 325.7L247.9 360.8zM416.1 64C436.2 64 455.5 67.7 473.2 74.5C483.2 78.3 485 91 477.5 98.6L420.8 155.3C417.8 158.3 416.1 162.4 416.1 166.6L416.1 208C416.1 216.8 423.3 224 432.1 224L473.5 224C477.7 224 481.8 222.3 484.8 219.3L541.5 162.6C549.1 155.1 561.8 156.9 565.6 166.9C572.4 184.6 576.1 203.9 576.1 224C576.1 267.2 558.9 306.3 531.1 335.1L482 286C448.9 253 403.5 240.3 360.9 247.6L304.1 190.8L304.1 161.1L303.9 156.1C303.1 143.7 299.5 131.8 293.4 121.2C322.8 86.2 366.8 64 416.1 63.9z" />
                          </svg>
                          Admin
                        </a>
                      </li>
                      <li className="tooltip-link">
                        <a className="tooltip-links user" href="/">
                          <svg
                            xmlns="http://www.w3.org/2000/svg"
                            viewBox="0 0 640 640"
                          >
                            <path d="M320 312C253.7 312 200 258.3 200 192C200 125.7 253.7 72 320 72C386.3 72 440 125.7 440 192C440 258.3 386.3 312 320 312zM289.5 368L350.5 368C360.2 368 368 375.8 368 385.5C368 389.7 366.5 393.7 363.8 396.9L336.4 428.9L367.4 544L368 544L402.6 405.5C404.8 396.8 413.7 391.5 422.1 394.7C484 418.3 528 478.3 528 548.5C528 563.6 515.7 575.9 500.6 575.9L139.4 576C124.3 576 112 563.7 112 548.6C112 478.4 156 418.4 217.9 394.8C226.3 391.6 235.2 396.9 237.4 405.6L272 544.1L272.6 544.1L303.6 429L276.2 397C273.5 393.8 272 389.8 272 385.6C272 375.9 279.8 368.1 289.5 368.1z" />
                          </svg>
                          User
                        </a>
                      </li>
                    </ul>
                  </div>
                </li>
              </ul>
            </div>
          </>
        ) : (
          <>
            <div className="disable-tooltip"></div>
          </>
        )}
        {/* biểu tượng shop */}
        <div className="symbolize-shop">
          <div className="cell">
            <div className="card">
              <span className="flower-loader">Loading…</span>
            </div>
          </div>
          <div>
            <h1 onClick={handleBrandClick} className="brand-name">
              AVICI
            </h1>
          </div>
        </div>
      </div>

      {/* navigation */}
      {isAdminPage ? (
        <>
          <div>
            <h1 color="white">ADMIN CONFIG</h1>
          </div>
        </>
      ) : (
        <>
          {/* Navigation hoặc Search Input */}
          {isSearching ? (
            <div ref={searchRef} className="search-bar-wrapper">
              <input
                type="text"
                className="search-input"
                placeholder="Nhập từ khóa để tìm..."
                autoFocus
                value={localQuery}
                onChange={(e) => setLocalQuery(e.target.value)}
                onKeyDown={handleSearchSubmit}
              />
              <button className="btn-close-search" onClick={handleSearchClose}>
                <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 640 640"><path d="M504.6 148.5C515.9 134.9 514.1 114.7 500.5 103.4C486.9 92.1 466.7 93.9 455.4 107.5L320 270L184.6 107.5C173.3 93.9 153.1 92.1 139.5 103.4C125.9 114.7 124.1 134.9 135.4 148.5L278.3 320L135.4 491.5C124.1 505.1 125.9 525.3 139.5 536.6C153.1 547.9 173.3 546.1 184.6 532.5L320 370L455.4 532.5C466.7 546.1 486.9 547.9 500.5 536.6C514.1 525.3 515.9 505.1 504.6 491.5L361.7 320L504.6 148.5z"/></svg>
              </button>
            </div>
          ) : (
            <div className="glass-radio-group">
              <input
                type="radio"
                onChange={handleClick}
                name="plan"
                id="home"
                checked={selected === "home"}
              />
              <label htmlFor="home">Home</label>

              <input
                type="radio"
                onChange={handleClick}
                name="plan"
                id="birthday-flower"
                checked={selected === "birthday-flower"}
              />
              <label htmlFor="birthday-flower">Birthday</label>

              <input
                type="radio"
                onChange={handleClick}
                name="plan"
                id="decorate-flower"
                checked={selected === "decorate-flower"}
              />
              <label htmlFor="decorate-flower">Decorate</label>

              <input
                type="radio"
                onChange={handleClick}
                name="plan"
                id="wedding-flower"
                checked={selected === "wedding-flower"}
              />
              <label htmlFor="wedding-flower">Wedding</label>

              <input
                type="radio"
                onChange={handleClick}
                name="plan"
                id="graduate-flower"
                checked={selected === "graduate-flower"}
              />
              <label htmlFor="graduate-flower">Graduate</label>

              <input
                type="radio"
                onChange={handleClick}
                name="plan"
                id="funeral-flower"
                checked={selected === "funeral-flower"}
              />
              <label htmlFor="funeral-flower">Funeral</label>

              <div className="glass-glider"></div>
            </div>
          )}
        </>
      )}

      {!isAdminPage && isLogined && (
        <div className="search-and-cart">
          <div className="search">
            <button ref={searchButtonRef} onClick={handleSearch}>
              <svg
                xmlns="http://www.w3.org/2000/svg"
                viewBox="0 0 640 640"
                style={{ width: 24, height: 24 }}
              >
                <path d="M480 272C480 317.9 465.1 360.3 440 394.7L566.6 521.4C579.1 533.9 579.1 554.2 566.6 566.7C554.1 579.2 533.8 579.2 521.3 566.7L394.7 440C360.3 465.1 317.9 480 272 480C157.1 480 64 386.9 64 272C64 157.1 157.1 64 272 64C386.9 64 480 157.1 480 272zM272 416C351.5 416 416 351.5 416 272C416 192.5 351.5 128 272 128C192.5 128 128 192.5 128 272C128 351.5 192.5 416 272 416z" />
              </svg>
            </button>
          </div>
          <div className="cart-button">
            <button onClick={handleCart}>
              <svg
                xmlns="http://www.w3.org/2000/svg"
                viewBox="0 0 640 640"
                style={{ width: 24, height: 24 }}
              >
                <path d="M64 64C46.3 64 32 78.3 32 96C32 113.7 46.3 128 64 128L80 128C88.8 128 96 135.2 96 144L96 432C96 471.8 125.1 504.8 163.1 511C161.1 516.3 160 522 160 528C160 554.5 181.5 576 208 576C234.5 576 256 554.5 256 528C256 522.4 255 517 253.3 512L450.8 512C449 517 448.1 522.4 448.1 528C448.1 554.5 469.6 576 496.1 576C522.6 576 544.1 554.5 544.1 528C544.1 522.4 543.1 517 541.4 512L576.1 512C593.8 512 608.1 497.7 608.1 480C608.1 462.3 593.8 448 576.1 448L176.1 448C167.3 448 160.1 440.8 160.1 432L160.1 144C160 99.8 124.2 64 80 64L64 64zM256 128C229.5 128 208 149.5 208 176L208 352C208 378.5 229.5 400 256 400L496 400C522.5 400 544 378.5 544 352L544 176C544 149.5 522.5 128 496 128L256 128z" />
              </svg>
              {totalCartItems && (
                <span className="badge">{totalCartItems}</span>
              )}
            </button>
          </div>
        </div>
      )}

      {/* profile + logout */}
      <div className="profile-logout-wrapper">
        {isLogined ? (
          <div className="radio-inputs">
            <label className="radio">
              <input
                onChange={handleClick}
                name="radio"
                type="radio"
                id="profile"
                checked={selected === "profile"}
              />
              <span className="name profile">Profile</span>
            </label>
            <label className="radio">
              <input
                name="radio"
                onChange={handleClick}
                type="radio"
                id="log-out"
                checked={selected === "log-out"}
              />
              <span className="name log-out">Log out</span>
            </label>
          </div>
        ) : (
          <div className="radio-inputs">
            <label className="radio">
              <input
                onChange={handleClick}
                name="radio"
                type="radio"
                id="login"
                checked={selected === "login"}
              />
              <span className="name profile">Login</span>
            </label>
            <label className="radio">
              <input
                name="radio"
                onChange={handleClick}
                type="radio"
                id="register"
                checked={selected === "register"}
              />
              <span className="name log-out">Register</span>
            </label>
          </div>
        )}
      </div>
    </div>
  );
};

export default Header;
