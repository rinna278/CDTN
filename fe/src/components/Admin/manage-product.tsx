import './manage-product.css'

const ManageProduct = () => {
    const products = [
        { name: 'Hoa Hồng Đỏ', category: 'Hoa Hồng', price: '150,000', stock: 45 },
        { name: 'Hoa Tulip Trắng', category: 'Hoa Tulip', price: '120,000', stock: 32 },
        { name: 'Hoa Cúc Vàng', category: 'Hoa Cúc', price: '80,000', stock: 58 },
        { name: 'Hoa Ly Trắng', category: 'Hoa Ly', price: '200,000', stock: 28 },
        { name: 'Hoa Hồng Cam', category: 'Hoa Hồng', price: '180,000', stock: 55 },
    ];
    return (
        <>
            <div className="content-top-product">
                <div className="title_description">
                    <h1>Quản Lý Sản Phẩm</h1>
                    <h5>Quản lý danh sách hoa và danh mục</h5>
                </div>
                <div className="btn-add-product">
                    <div className="box-button">
                        <div className="button"><span> + Thêm sản phẩm</span></div>
                    </div>
                </div>
            </div>
            <div className='search'>
                <div className="group">
                    <svg className="icon" aria-hidden="true" viewBox="0 0 24 24"><g><path d="M21.53 20.47l-3.66-3.66C19.195 15.24 20 13.214 20 11c0-4.97-4.03-9-9-9s-9 4.03-9 9 4.03 9 9 9c2.215 0 4.24-.804 5.808-2.13l3.66 3.66c.147.146.34.22.53.22s.385-.073.53-.22c.295-.293.295-.767.002-1.06zM3.5 11c0-4.135 3.365-7.5 7.5-7.5s7.5 3.365 7.5 7.5-3.365 7.5-7.5 7.5-7.5-3.365-7.5-7.5z"></path></g></svg>
                    <input placeholder="Search" type="search" className="input"/>
                </div>
            </div>
            <div className="content-middle-product">
                <div className='title_table'>
                    <h2>Danh Sách Sản Phẩm</h2>
                    <h5>Tổng cộng có ${products.length} loại</h5>
                </div>
                <div className='table_list'>
                    <table>
                        <thead>
                            <tr>
                                <th>Tên Sản phẩm</th>
                                <th>Danh mục</th>
                                <th>Giá</th>
                                <th>Tồn kho</th>
                                <th>Hành động</th>
                            </tr>
                        </thead>
                        <tbody>
                            {products.map((product, index) => (
                                <tr key={index}>
                                    <td>{product.name}</td>
                                    <td>{product.category}</td>
                                    <td>{`₫${product.price}`}</td>
                                    <td>{product.stock}</td>
                                    <td>
                                        <button className="edit">
                                            <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 640 640"><path d="M416.9 85.2L372 130.1L509.9 268L554.8 223.1C568.4 209.6 576 191.2 576 172C576 152.8 568.4 134.4 554.8 120.9L519.1 85.2C505.6 71.6 487.2 64 468 64C448.8 64 430.4 71.6 416.9 85.2zM338.1 164L122.9 379.1C112.2 389.8 104.4 403.2 100.3 417.8L64.9 545.6C62.6 553.9 64.9 562.9 71.1 569C77.3 575.1 86.2 577.5 94.5 575.2L222.3 539.7C236.9 535.6 250.2 527.9 261 517.1L476 301.9L338.1 164z"/></svg>
                                        </button>
                                        <button className="delete">
                                            <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 640 640"><path d="M232.7 69.9L224 96L128 96C110.3 96 96 110.3 96 128C96 145.7 110.3 160 128 160L512 160C529.7 160 544 145.7 544 128C544 110.3 529.7 96 512 96L416 96L407.3 69.9C402.9 56.8 390.7 48 376.9 48L263.1 48C249.3 48 237.1 56.8 232.7 69.9zM512 208L128 208L149.1 531.1C150.7 556.4 171.7 576 197 576L443 576C468.3 576 489.3 556.4 490.9 531.1L512 208z"/></svg>
                                        </button>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            </div>
            <div className="content-bottom-product">
                <div className='title_bottom'>
                    <h2>Quản Lý Danh Mục</h2>
                    <h5>Các danh mục sản phẩm</h5>
                </div>
                <div className='card-category'>
                    <div className='item-cart-category'>
                        <h4>Hoa Hồng</h4>
                        <p>12 sản phẩm</p>
                        <div className='btn_action'>
                            <button>Sửa</button>
                            <button>Xóa</button>
                        </div>
                    </div>
                    <div className='item-cart-category'>
                        <h4>Hoa TuLip</h4>
                        <p>12 sản phẩm</p>
                        <div className='btn_action'>
                            <button>Sửa</button>
                            <button>Xóa</button>
                        </div>
                    </div>
                    <div className='item-cart-category'>
                        <h4>Hoa Cúc</h4>
                        <p>12 sản phẩm</p>
                        <div className='btn_action'>
                            <button>Sửa</button>
                            <button>Xóa</button>
                        </div>
                    </div>
                    <div className='item-cart-category'>
                        <h4>Hoa Ly</h4>
                        <p>12 sản phẩm</p>
                        <div className='btn_action'>
                            <button>Sửa</button>
                            <button>Xóa</button>
                        </div>
                    </div>
                    
                </div>
            </div>
        </>
    )
}

export default ManageProduct;