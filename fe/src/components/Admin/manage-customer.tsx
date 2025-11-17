import './manage-customer.css'

const ManageCustomer = () => {
    const customers = [
        {
            nameCustomer: 'Nguyễn Văn A',
            email: 'nguyenvana@email.com',
            phone: '0901234567',
            ordersCount: 5,
            totalSpent: '2,150,000',
        },
        {
            nameCustomer: 'Trần Thị B',
            email: 'tranthib@email.com',
            phone: '0912345678',
            ordersCount: 3,
            totalSpent: '1,500,000',
        },
        {
            nameCustomer: 'Lê Hoàng C',
            email: 'lehoangc@email.com',
            phone: '0987654321',
            ordersCount: 10,
            totalSpent: '5,800,000',
        },
        {
            nameCustomer: 'Phạm Minh D',
            email: 'phamd@email.com',
            phone: '0978123456',
            ordersCount: 1,
            totalSpent: '150,000',
        },
        {
            nameCustomer: 'Đỗ Thị E',
            email: 'dothie@email.com',
            phone: '0965432109',
            ordersCount: 7,
            totalSpent: '4,050,000',
        },
    ];
    return (
        <>
            <div className="content-top-customer">
                <div className="title_description">
                    <h1>Quản Lý Khách Hàng</h1>
                    <h5>Danh sách và thông tin khách hàng</h5>
                </div>
                <div className="content-middle-customer">
                    <div className="item-customer">
                        <div className="all-customer">
                            <h4>Tổng Khách hàng</h4>
                            <p>1,234</p>
                        </div>
                        <div className="new-customer">
                            <h4>Khách mới (Tháng)</h4>
                            <p>87</p>
                        </div>
                        <div className="rate-customer">
                            <h4>Đánh giá chăm sóc KH</h4>
                            <p>94%</p>
                        </div>
                    </div>
                    <div className='table-customers'>
                        <div className='title_table'>
                            <h2>Danh Sách Khách Hàng</h2>
                            <h5>Tổng cộng có ${customers.length} khách hàng</h5>
                        </div>
                        <div className='customer-data'>
                            <table>
                                <thead>
                                    <tr>
                                        <th>Tên Khách Hàng</th>
                                        <th>Email</th>
                                        <th>Điện thoại</th>
                                        <th>Đơn hàng</th>
                                        <th>Tổng chi tiêu</th>
                                        <th>Hành động</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {customers.map((customer, index) => (
                                        <tr key={index}>
                                            <td>{customer.nameCustomer}</td>
                                            <td className='email'>
                                                <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 640 640"><path d="M125.4 128C91.5 128 64 155.5 64 189.4C64 190.3 64 191.1 64.1 192L64 192L64 448C64 483.3 92.7 512 128 512L512 512C547.3 512 576 483.3 576 448L576 192L575.9 192C575.9 191.1 576 190.3 576 189.4C576 155.5 548.5 128 514.6 128L125.4 128zM528 256.3L528 448C528 456.8 520.8 464 512 464L128 464C119.2 464 112 456.8 112 448L112 256.3L266.8 373.7C298.2 397.6 341.7 397.6 373.2 373.7L528 256.3zM112 189.4C112 182 118 176 125.4 176L514.6 176C522 176 528 182 528 189.4C528 193.6 526 197.6 522.7 200.1L344.2 335.5C329.9 346.3 310.1 346.3 295.8 335.5L117.3 200.1C114 197.6 112 193.6 112 189.4z"/></svg>
                                                {customer.email}
                                            </td>
                                            <td>
                                                <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 640 640"><path d="M224.2 89C216.3 70.1 195.7 60.1 176.1 65.4L170.6 66.9C106 84.5 50.8 147.1 66.9 223.3C104 398.3 241.7 536 416.7 573.1C493 589.3 555.5 534 573.1 469.4L574.6 463.9C580 444.2 569.9 423.6 551.1 415.8L453.8 375.3C437.3 368.4 418.2 373.2 406.8 387.1L368.2 434.3C297.9 399.4 241.3 341 208.8 269.3L253 233.3C266.9 222 271.6 202.9 264.8 186.3L224.2 89z"/></svg>
                                                {customer.phone}
                                            </td>
                                            <td className='order-number'>{customer.ordersCount}</td>
                                            <td>{`₫${customer.totalSpent}`}</td>
                                            <td>
                                                <button className='edit'>
                                                    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 640 640"><path d="M100.4 417.2C104.5 402.6 112.2 389.3 123 378.5L304.2 197.3L338.1 163.4C354.7 180 389.4 214.7 442.1 267.4L476 301.3L442.1 335.2L260.9 516.4C250.2 527.1 236.8 534.9 222.2 539L94.4 574.6C86.1 576.9 77.1 574.6 71 568.4C64.9 562.2 62.6 553.3 64.9 545L100.4 417.2zM156 413.5C151.6 418.2 148.4 423.9 146.7 430.1L122.6 517L209.5 492.9C215.9 491.1 221.7 487.8 226.5 483.2L155.9 413.5zM510 267.4C493.4 250.8 458.7 216.1 406 163.4L372 129.5C398.5 103 413.4 88.1 416.9 84.6C430.4 71 448.8 63.4 468 63.4C487.2 63.4 505.6 71 519.1 84.6L554.8 120.3C568.4 133.9 576 152.3 576 171.4C576 190.5 568.4 209 554.8 222.5C551.3 226 536.4 240.9 509.9 267.4z"/></svg>
                                                </button>
                                                <button className='delete'>
                                                    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 640 640"><path d="M232.7 69.9L224 96L128 96C110.3 96 96 110.3 96 128C96 145.7 110.3 160 128 160L512 160C529.7 160 544 145.7 544 128C544 110.3 529.7 96 512 96L416 96L407.3 69.9C402.9 56.8 390.7 48 376.9 48L263.1 48C249.3 48 237.1 56.8 232.7 69.9zM512 208L128 208L149.1 531.1C150.7 556.4 171.7 576 197 576L443 576C468.3 576 489.3 556.4 490.9 531.1L512 208z"/></svg>
                                                </button>
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    </div>
                </div>
            </div>
        </>
    )
}

export default ManageCustomer;