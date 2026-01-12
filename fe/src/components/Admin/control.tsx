import { Link } from 'react-router-dom';
import './control.css'
import { getAllOrders, getAllProduct, getAllUser } from '../../services/apiService';
import { useEffect, useState } from 'react';



const AdminControl = () => {
    const [allProductStatistic, setAllProductStatistic] = useState(0);
    const [allOrdersStatistic, setAllOrdersStatistic] = useState(0);
    const [allUserStatistic, setAllUserStatistic] = useState(0);

    useEffect(() => {
        const fetchProduct = async() => {
            const res = await getAllProduct({});
            setAllProductStatistic(res.total);
        }
        const fetchOrders = async () => {
            const res1 = await getAllOrders({});
            setAllOrdersStatistic(res1.total)
        }
        const fetchUsers = async() => {
            const res2 = await getAllUser();
            setAllUserStatistic(res2.totalItem);
        }

        fetchProduct();
        fetchOrders();
        fetchUsers();
    }, [])

    return (
        <>
            <h1>DashBoard</h1>
            <div className="control-container">
                <div className="content-top-control">
                    <div className="control-item">
                        <button>
                            <div className='item-1'>
                                <span>Tổng Sản Phẩm</span>
                                <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 640 640">
                                    <path d="M560.3 301.2C570.7 313 588.6 315.6 602.1 306.7C616.8 296.9 620.8 277 611 262.3L563 190.3C560.2 186.1 556.4 182.6 551.9 180.1L351.4 68.7C332.1 58 308.6 58 289.2 68.7L88.8 180C83.4 183 79.1 187.4 76.2 192.8L27.7 282.7C15.1 306.1 23.9 335.2 47.3 347.8L80.3 365.5L80.3 418.8C80.3 441.8 92.7 463.1 112.7 474.5L288.7 574.2C308.3 585.3 332.2 585.3 351.8 574.2L527.8 474.5C547.9 463.1 560.2 441.9 560.2 418.8L560.2 301.3zM320.3 291.4L170.2 208L320.3 124.6L470.4 208L320.3 291.4zM278.8 341.6L257.5 387.8L91.7 299L117.1 251.8L278.8 341.6z"/>
                                </svg>
                            </div>
                            <h4>{allProductStatistic}</h4>
                        </button>
                    </div>
                    
                    <div className="control-item">
                        <button>
                            <div className='item-2'>
                                <span>Tổng Đơn Hàng</span>
                                <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 640 640">
                                    <path d="M64 64C46.3 64 32 78.3 32 96C32 113.7 46.3 128 64 128L80 128C88.8 128 96 135.2 96 144L96 432C96 471.8 125.1 504.8 163.1 511C161.1 516.3 160 522 160 528C160 554.5 181.5 576 208 576C234.5 576 256 554.5 256 528C256 522.4 255 517 253.3 512L450.8 512C449 517 448.1 522.4 448.1 528C448.1 554.5 469.6 576 496.1 576C522.6 576 544.1 554.5 544.1 528C544.1 522.4 543.1 517 541.4 512L576.1 512C593.8 512 608.1 497.7 608.1 480C608.1 462.3 593.8 448 576.1 448L176.1 448C167.3 448 160.1 440.8 160.1 432L160.1 144C160 99.8 124.2 64 80 64L64 64zM256 128C229.5 128 208 149.5 208 176L208 352C208 378.5 229.5 400 256 400L496 400C522.5 400 544 378.5 544 352L544 176C544 149.5 522.5 128 496 128L256 128z"/>
                                </svg>
                            </div>
                            <h4>{allOrdersStatistic}</h4>
                        </button>
                    </div>

                    <div className="control-item">
                        <button>
                            <div className='item-3'>
                                <span>Khách Hàng</span>
                                <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 640 640">
                                    <path d="M320 80C377.4 80 424 126.6 424 184C424 241.4 377.4 288 320 288C262.6 288 216 241.4 216 184C216 126.6 262.6 80 320 80zM96 152C135.8 152 168 184.2 168 224C168 263.8 135.8 296 96 296C56.2 296 24 263.8 24 224C24 184.2 56.2 152 96 152zM0 480C0 409.3 57.3 352 128 352C140.8 352 153.2 353.9 164.9 357.4C132 394.2 112 442.8 112 496L112 512C112 523.4 114.4 534.2 118.7 544L32 544C14.3 544 0 529.7 0 512L0 480zM521.3 544C525.6 534.2 528 523.4 528 512L528 496C528 442.8 508 394.2 475.1 357.4C486.8 353.9 499.2 352 512 352C582.7 352 640 409.3 640 480L640 512C640 529.7 625.7 544 608 544L521.3 544zM472 224C472 184.2 504.2 152 544 152C583.8 152 616 184.2 616 224C616 263.8 583.8 296 544 296C504.2 296 472 263.8 472 224zM160 496C160 407.6 231.6 336 320 336C408.4 336 480 407.6 480 496L480 512C480 529.7 465.7 544 448 544L192 544C174.3 544 160 529.7 160 512L160 496z"/>
                                </svg>
                            </div>
                            <h4>{allUserStatistic}</h4>
                        </button>
                    </div>

                    <div className="control-item">
                        <button>
                            <div className='item-4'>
                                <span>Doanh Thu</span>
                                <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 640 640">
                                    <path d="M160 96C124.7 96 96 124.7 96 160L96 480C96 515.3 124.7 544 160 544L480 544C515.3 544 544 515.3 544 480L544 160C544 124.7 515.3 96 480 96L160 96zM216 288C229.3 288 240 298.7 240 312L240 424C240 437.3 229.3 448 216 448C202.7 448 192 437.3 192 424L192 312C192 298.7 202.7 288 216 288zM400 376C400 362.7 410.7 352 424 352C437.3 352 448 362.7 448 376L448 424C448 437.3 437.3 448 424 448C410.7 448 400 437.3 400 424L400 376zM320 192C333.3 192 344 202.7 344 216L344 424C344 437.3 333.3 448 320 448C306.7 448 296 437.3 296 424L296 216C296 202.7 306.7 192 320 192z"/>
                                </svg>
                            </div>
                            <h4>45.8M VND</h4>
                        </button>
                    </div>
                    
                </div>

                <div className="content-bottom-control">
                    <h3>Hành động nhanh</h3>
                    <p>Các tác vụ quản lý chính</p>
                    <div className="quick-actions">
                        <Link to="/admin/manage-product" className="quick-item">
                        <div className="quick-icon red">
                            <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 640 640">
                            <path d="M560.3 301.2C570.7 313 588.6 315.6 602.1 306.7C616.8 296.9 620.8 277 611 262.3L563 190.3C560.2 186.1 556.4 182.6 551.9 180.1L351.4 68.7C332.1 58 308.6 58 289.2 68.7L88.8 180C83.4 183 79.1 187.4 76.2 192.8L27.7 282.7C15.1 306.1 23.9 335.2 47.3 347.8L80.3 365.5L80.3 418.8C80.3 441.8 92.7 463.1 112.7 474.5L288.7 574.2C308.3 585.3 332.2 585.3 351.8 574.2L527.8 474.5C547.9 463.1 560.2 441.9 560.2 418.8L560.2 301.3zM320.3 291.4L170.2 208L320.3 124.6L470.4 208L320.3 291.4zM278.8 341.6L257.5 387.8L91.7 299L117.1 251.8L278.8 341.6z"/>
                            </svg>
                        </div>
                        <span>Thêm Sản phẩm</span>
                        </Link>

                        <Link to="/admin/manage-order" className="quick-item">
                        <div className="quick-icon green">
                            <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 640 640">
                            <path d="M64 64C46.3 64 32 78.3 32 96C32 113.7 46.3 128 64 128L80 128C88.8 128 96 135.2 96 144L96 432C96 471.8 125.1 504.8 163.1 511C161.1 516.3 160 522 160 528C160 554.5 181.5 576 208 576C234.5 576 256 554.5 256 528C256 522.4 255 517 253.3 512L450.8 512C449 517 448.1 522.4 448.1 528C448.1 554.5 469.6 576 496.1 576C522.6 576 544.1 554.5 544.1 528C544.1 522.4 543.1 517 541.4 512L576.1 512C593.8 512 608.1 497.7 608.1 480C608.1 462.3 593.8 448 576.1 448L176.1 448C167.3 448 160.1 440.8 160.1 432L160.1 144C160 99.8 124.2 64 80 64L64 64zM256 128C229.5 128 208 149.5 208 176L208 352C208 378.5 229.5 400 256 400L496 400C522.5 400 544 378.5 544 352L544 176C544 149.5 522.5 128 496 128L256 128z"/>
                            </svg>
                        </div>
                        <span>Xem Đơn hàng</span>
                        </Link>

                        <Link to="/admin/manage-customer" className="quick-item">
                        <div className="quick-icon purple">
                            <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 640 640">
                            <path d="M320 80C377.4 80 424 126.6 424 184C424 241.4 377.4 288 320 288C262.6 288 216 241.4 216 184C216 126.6 262.6 80 320 80zM96 152C135.8 152 168 184.2 168 224C168 263.8 135.8 296 96 296C56.2 296 24 263.8 24 224C24 184.2 56.2 152 96 152zM0 480C0 409.3 57.3 352 128 352C140.8 352 153.2 353.9 164.9 357.4C132 394.2 112 442.8 112 496L112 512C112 523.4 114.4 534.2 118.7 544L32 544C14.3 544 0 529.7 0 512L0 480zM521.3 544C525.6 534.2 528 523.4 528 512L528 496C528 442.8 508 394.2 475.1 357.4C486.8 353.9 499.2 352 512 352C582.7 352 640 409.3 640 480L640 512C640 529.7 625.7 544 608 544L521.3 544zM472 224C472 184.2 504.2 152 544 152C583.8 152 616 184.2 616 224C616 263.8 583.8 296 544 296C504.2 296 472 263.8 472 224zM160 496C160 407.6 231.6 336 320 336C408.4 336 480 407.6 480 496L480 512C480 529.7 465.7 544 448 544L192 544C174.3 544 160 529.7 160 512L160 496z"/>
                            </svg>
                        </div>
                        <span>Khách hàng</span>
                        </Link>
                    </div>
                </div>
            </div>
        </>
    )
}

export default AdminControl;