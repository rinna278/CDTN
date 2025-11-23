import './manage-order.css'

const ManageOrder = () => {
    const orders = [
        {
            maDon: 'ORD001',
            nameCustomer: 'Nguyễn Văn A',
            totalPrice: "1,250,000",
            status: 'Chờ xử lý',
            date: '25/10/2025',
        },
        {
            maDon: 'ORD002',
            nameCustomer: 'Trần Thị B',
            totalPrice: "980,000",
            status: 'Đang xử lý',
            date: '24/10/2025',
        },
        {
            maDon: 'ORD003',
            nameCustomer: 'Lê Hoàng C',
            totalPrice: "2,175,000",
            status: 'Hoàn thành',
            date: '22/10/2025',
        },
        {
            maDon: 'ORD004',
            nameCustomer: 'Phạm Minh D',
            totalPrice: "150,000",
            status: 'Chờ xử lý',
            date: '21/10/2025',
        },
        {
            maDon: 'ORD005',
            nameCustomer: 'Đỗ Thị E',
            totalPrice: "3,200,000",
            status: 'Hoàn thành',
            date: '20/10/2025',
        },
        {
            maDon: 'ORD006',
            nameCustomer: 'Ngô Thanh F',
            totalPrice: "875.000",
            status: 'Đang xử lý',
            date: '18/10/2025',
        },
    ];
    return (
        <>
            <div className="content-top-order">
                <div className="title_description">
                    <h1>Quản Lý Đơn Hàng</h1>
                    <h5>Danh sách và cập nhật trạng thái đơn hàng</h5>
                </div>
            </div>
            <div className="content-middle-order">
                <div className="item-order">
                    <div className="status-order-1">
                        <h4>Chờ xử lý</h4>
                        <p>8</p>
                    </div>
                    <div className="status-order-2">
                        <h4>Đang xử lý</h4>
                        <p>5</p>
                    </div>
                    <div className="status-order-3">
                        <h4>Hoàn thành</h4>
                        <p>798</p>
                    </div>
                </div>
                <div className='table-orders'>
                    <div className='title_table'>
                        <h2>Danh Sách Đơn Hàng</h2>
                        <h5>Tổng cộng có ${orders.length} đơn hàng gần đây</h5>
                    </div>
                    <div className='order-data'>
                        <table>
                            <thead>
                                <tr>
                                    <th>Mã Đơn Hàng</th>
                                    <th>Tên Khách Hàng</th>
                                    <th>Tổng tiền</th>
                                    <th>Trạng thái đơn</th>
                                    <th>Ngày</th>
                                    <th>Hành động</th>
                                </tr>
                            </thead>
                            <tbody>
                                {orders.map((order, index) => (
                                    <tr key={index}>
                                        <td>{order.maDon}</td>
                                        <td>{order.nameCustomer}</td>
                                        <td>{`₫${order.totalPrice}`}</td>
                                        <td>
                                            <span className={`status-badge ${
                                                order.status === 'Chờ xử lý'
                                                    ? 'pending'
                                                    : order.status === 'Đang xử lý'
                                                    ? 'processing'
                                                    : 'completed'
                                                }`}>
                                                {order.status === 'Chờ xử lý' && (
                                                <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 640 640"><path fill='#EA9D4A' d="M320 576C178.6 576 64 461.4 64 320C64 178.6 178.6 64 320 64C461.4 64 576 178.6 576 320C576 461.4 461.4 576 320 576zM320 384C302.3 384 288 398.3 288 416C288 433.7 302.3 448 320 448C337.7 448 352 433.7 352 416C352 398.3 337.7 384 320 384zM320 192C301.8 192 287.3 207.5 288.6 225.7L296 329.7C296.9 342.3 307.4 352 319.9 352C332.5 352 342.9 342.3 343.8 329.7L351.2 225.7C352.5 207.5 338.1 192 319.8 192z"/></svg>
                                                )}
                                                {order.status === 'Đang xử lý' && (
                                                <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 640 640"><path fill='#2169FC' d="M320 64C461.4 64 576 178.6 576 320C576 461.4 461.4 576 320 576C178.6 576 64 461.4 64 320C64 178.6 178.6 64 320 64zM296 184L296 320C296 328 300 335.5 306.7 340L402.7 404C413.7 411.4 428.6 408.4 436 397.3C443.4 386.2 440.4 371.4 429.3 364L344 307.2L344 184C344 170.7 333.3 160 320 160C306.7 160 296 170.7 296 184z"/></svg>
                                                )}
                                                {order.status === 'Hoàn thành' && (
                                                <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 640 640"><path fill='#3FAD82' d="M530.8 134.1C545.1 144.5 548.3 164.5 537.9 178.8L281.9 530.8C276.4 538.4 267.9 543.1 258.5 543.9C249.1 544.7 240 541.2 233.4 534.6L105.4 406.6C92.9 394.1 92.9 373.8 105.4 361.3C117.9 348.8 138.2 348.8 150.7 361.3L252.2 462.8L486.2 141.1C496.6 126.8 516.6 123.6 530.9 134z"/></svg>
                                                )}
                                                <span>{order.status}</span>
                                            </span>
                                        </td>
                                        <td>{order.date}</td>
                                        <td>
                                            <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 640 640" fill='currentColor'><path d="M320 96C239.2 96 174.5 132.8 127.4 176.6C80.6 220.1 49.3 272 34.4 307.7C31.1 315.6 31.1 324.4 34.4 332.3C49.3 368 80.6 420 127.4 463.4C174.5 507.1 239.2 544 320 544C400.8 544 465.5 507.2 512.6 463.4C559.4 419.9 590.7 368 605.6 332.3C608.9 324.4 608.9 315.6 605.6 307.7C590.7 272 559.4 220 512.6 176.6C465.5 132.9 400.8 96 320 96zM176 320C176 240.5 240.5 176 320 176C399.5 176 464 240.5 464 320C464 399.5 399.5 464 320 464C240.5 464 176 399.5 176 320zM320 256C320 291.3 291.3 320 256 320C244.5 320 233.7 317 224.3 311.6C223.3 322.5 224.2 333.7 227.2 344.8C240.9 396 293.6 426.4 344.8 412.7C396 399 426.4 346.3 412.7 295.1C400.5 249.4 357.2 220.3 311.6 224.3C316.9 233.6 320 244.4 320 256z"/></svg>
                                            <span>Chi tiết</span>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                </div>
            </div>
            <div className='content-bottom-order'>
                <div className='title-bottom-order'>
                        <h2>Cập nhật Trạng thái Đơn hàng</h2>
                        <h5>Thay đổi trạng thái xử lý đơn hàng</h5>
                </div>
                <div className='update-status'>
                    <input placeholder='Nhập mã đơn hàng...'/>
                    <select>
                        <option>Chọn trạng thái</option>
                        <option>Chờ xử lý</option>
                        <option>Đang xử lý</option>
                        <option>Hoàn thành</option>
                    </select>
                    <button>Cập nhật</button>
                </div>
            </div>
        </>
    )
}

export default ManageOrder;