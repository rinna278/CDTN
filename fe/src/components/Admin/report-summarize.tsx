import './report-summarize.css'
import React, { useState } from 'react';
import { ChartOptions } from 'chart.js';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  BarElement,
  PointElement,
  LineElement,
  RadialLinearScale,
  ArcElement,
  Tooltip,
  Legend,
} from 'chart.js';
import { PolarArea, Bar, Line, Doughnut } from 'react-chartjs-2';
import ChartDataLabels from 'chartjs-plugin-datalabels';
ChartJS.register(ChartDataLabels);



// Đăng ký các module của ChartJS
ChartJS.register(
  CategoryScale,
  LinearScale,
  BarElement,
  PointElement,
  LineElement,
  RadialLinearScale,
  ArcElement,
  Tooltip,
  Legend
);

const ReportSummarize = () => {
  const [showModal, setShowModal] = useState(false);
  const [range, setRange] = useState('Tuần'); // Mặc định hiển thị tuần

  const handleTimeButtonClick = () => {
    setShowModal(!showModal);
  };

  const handleSelectRange = (selectedRange: string) => {
    setRange(selectedRange);
    setShowModal(false);
  };

  // Dữ liệu mô phỏng số lượng đơn hàng
  const dataByWeek = {
        labels: ['CN', 'T2', 'T3', 'T4', 'T5', 'T6', 'T7'], // CN trước
        datasets: [
            {
            label: 'Số lượng đơn hàng (đvt: đơn)',
            data: [9, 8, 10, 5, 7, 12, 6], // dữ liệu cũng xoay tương ứng
            backgroundColor: [
                '#8BC34A',
                '#FF6384',
                '#36A2EB',
                '#FFCE56',
                '#4BC0C0',
                '#9966FF',
                '#FF9F40',
            ],
            },
        ],
    };


  const dataByMonth = {
    labels: ['Tuần 1', 'Tuần 2', 'Tuần 3', 'Tuần 4'],
    datasets: [
      {
        label: 'Số lượng đơn hàng (đvt: đơn)',
        data: [30, 45, 28, 55],
        backgroundColor: '#36A2EB',
      },
    ],
  };

  const dataByYear = {
    labels: [
      'Th1', 'Th2', 'Th3', 'Th4', 'Th5', 'Th6',
      'Th7', 'Th8', 'Th9', 'Th10', 'Th11', 'Th12',
    ],
    datasets: [
      {
        label: 'Số lượng đơn hàng (đvt: đơn)',
        data: [120, 100, 150, 130, 170, 160, 190, 175, 180, 200, 210, 250],
        borderColor: '#FF6384',
        backgroundColor: 'rgba(255, 99, 132, 0.3)',
        tension: 0.4,
        fill: true,
      },
    ],
  };

  // Dữ liệu mô phỏng doanh thu
  const dataByWeekVenue = {
        labels: ['CN', 'T2', 'T3', 'T4', 'T5', 'T6', 'T7'], // CN trước
        datasets: [
            {
            label: 'Tổng doanh thu (đvt: triệu VND)',
            data: [120, 8, 10, 5, 7, 12.4, 3], // dữ liệu cũng xoay tương ứng
            backgroundColor: [
                '#8BC34A',
                '#FF6384',
                '#36A2EB',
                '#FFCE56',
                '#4BC0C0',
                '#9966FF',
                '#FF9F40',
            ],
            },
        ],
    };


  const dataByMonthVenue = {
    labels: ['Tuần 1', 'Tuần 2', 'Tuần 3', 'Tuần 4'],
    datasets: [
      {
        label: 'Tổng doanh thu (đvt: triệu VND)',
        data: [30, 45, 28, 10],
        backgroundColor: '#20c0adff',
      },
    ],
  };

  const dataByYearVenue = {
    labels: [
      'Th1', 'Th2', 'Th3', 'Th4', 'Th5', 'Th6',
      'Th7', 'Th8', 'Th9', 'Th10', 'Th11', 'Th12',
    ],
    datasets: [
      {
        label: 'Tổng doanh thu (đvt: triệu VND)',
        data: [120, 100, 150, 130, 170, 160, 190, 175, 180, 200, 210, 250],
        borderColor: '#FF6384',
        backgroundColor: 'rgba(255, 99, 132, 0.3)',
        tension: 0.4,
        fill: true,
      },
    ],
  };
  const commonOptions: ChartOptions<'polarArea' | 'bar' | 'line' | 'doughnut'> = {
        plugins: {
            legend: {
            display: true,
            labels: {
                color: '#333',
                font: { size: 14 },
            },
            },
            datalabels: {
            color: '#111',
            anchor: 'center',
            align: 'end', // ✅ dùng 'end' thay vì 'top'
            font: {
                weight: 'bold',
                size: 12,
            },
            formatter: (value: number) => value, // ✅ khai báo kiểu rõ ràng
            },
        },
        scales: {
            y: {
            beginAtZero: true,
            },
        },
    };

    const getChartTitle = () => {
      switch (range) {
        case 'Tuần':
          return 'Biểu đồ thể hiện số lượng đơn hàng theo Ngày';
        case 'Tháng':
          return 'Biểu đồ thể hiện số lượng đơn hàng theo Tuần';
        case 'Năm':
          return 'Biểu đồ thể hiện số lượng đơn hàng theo Tháng';
        default:
          return 'Biểu đồ thể hiện số lượng Đơn hàng';
      }
    };
    const getChartTitle2 = () => {
      switch (range) {
        case 'Tuần':
          return 'Biểu đồ thể hiện tổng doanh thu theo Ngày';
        case 'Tháng':
          return 'Biểu đồ thể hiện tổng doanh thu theo Tuần';
        case 'Năm':
          return 'Biểu đồ thể hiện tổng doanh thu theo Tháng';
        default:
          return 'Biểu đồ thể hiện số lượng Đơn hàng';
      }
    };

  return (
    <>
      <div className="content-top-report">
        <div className="title_description">
          <h1>Quản Lý Sản Phẩm</h1>
          <h5>Quản lý danh sách hoa và danh mục</h5>
        </div>
        <div className='btn-select-time'>
          <button className="button-with-icon" onClick={handleTimeButtonClick}>
            <svg
              className="icon"
              xmlns="http://www.w3.org/2000/svg"
              viewBox="0 0 640 640"
            >
              <path
                className="color000000 svgShape"
                fill="#ffffff"
                d="M216 64C229.3 64 240 74.7 240 88L240 128L400 128L400 88C400 74.7 410.7 64 424 64C437.3 64 448 74.7 448 88L448 128L480 128C515.3 128 544 156.7 544 192L544 480C544 515.3 515.3 544 480 544L160 544C124.7 544 96 515.3 96 480L96 192C96 156.7 124.7 128 160 128L192 128L192 88C192 74.7 202.7 64 216 64zM480 496C488.8 496 496 488.8 496 480L496 416L408 416L408 496L480 496zM496 368L496 288L408 288L408 368L496 368zM360 368L360 288L280 288L280 368L360 368zM232 368L232 288L144 288L144 368L232 368zM144 416L144 480C144 488.8 151.2 496 160 496L232 496L232 416L144 416zM280 416L280 496L360 496L360 416L280 416zM216 176L160 176C151.2 176 144 183.2 144 192L144 240L496 240L496 192C496 183.2 488.8 176 480 176L216 176z"
              ></path>
            </svg>
            <span className="text">{range}</span>
          </button>
          {showModal && (
            <div className="time-selection-modal">
              <button className="modal-tab-btn" onClick={() => handleSelectRange('Tuần')}>Tuần</button>
              <button className="modal-tab-btn" onClick={() => handleSelectRange('Tháng')}>Tháng</button>
              <button className="modal-tab-btn" onClick={() => handleSelectRange('Năm')}>Năm</button>
            </div>
          )}
        </div>
      </div>

      <div className="content-middle-report">
        <div className="item-report">
          <div className="venue-month">
                <h3>Doanh thu tháng này</h3>
                <p>₫4.8M</p>
                <h5>
                    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 640 640"><path d="M160 96C142.3 96 128 110.3 128 128C128 145.7 142.3 160 160 160L178.7 160L73.4 265.4C60.9 277.9 60.9 298.2 73.4 310.7C85.9 323.2 106.2 323.2 118.7 310.7L224 205.3L224 224C224 241.7 238.3 256 256 256C273.7 256 288 241.7 288 224L288 128C288 110.3 273.7 96 256 96L160 96zM467.8 134.1C467.8 155.1 484.9 172.2 505.9 172.2C526.9 172.2 544 155.1 544 134.1C544 113.1 526.9 96 505.9 96C484.9 96 467.8 113.1 467.8 134.1zM343.7 258.2C343.7 279.2 360.8 296.3 381.8 296.3C402.8 296.3 419.9 279.2 419.9 258.2C419.9 237.2 402.8 220.1 381.8 220.1C360.8 220.1 343.7 237.2 343.7 258.2zM505.9 220.1C484.9 220.1 467.8 237.2 467.8 258.2C467.8 279.2 484.9 296.3 505.9 296.3C526.9 296.3 544 279.2 544 258.2C544 237.2 526.9 220.1 505.9 220.1zM220.2 381.8C220.2 402.8 237.3 419.9 258.3 419.9C279.3 419.9 296.4 402.8 296.4 381.8C296.4 360.8 279.3 343.7 258.3 343.7C237.3 343.7 220.2 360.8 220.2 381.8zM381.8 343.7C360.8 343.7 343.7 360.8 343.7 381.8C343.7 402.8 360.8 419.9 381.8 419.9C402.8 419.9 419.9 402.8 419.9 381.8C419.9 360.8 402.8 343.7 381.8 343.7zM467.9 381.8C467.9 402.8 485 419.9 506 419.9C527 419.9 544.1 402.8 544.1 381.8C544.1 360.8 527 343.7 506 343.7C485 343.7 467.9 360.8 467.9 381.8zM134.1 467.8C113.1 467.8 96 484.9 96 505.9C96 526.9 113.1 544 134.1 544C155.1 544 172.2 526.9 172.2 505.9C172.2 484.9 155.1 467.8 134.1 467.8zM220.2 505.9C220.2 526.9 237.3 544 258.3 544C279.3 544 296.4 526.9 296.4 505.9C296.4 484.9 279.3 467.8 258.3 467.8C237.3 467.8 220.2 484.9 220.2 505.9zM381.8 467.8C360.8 467.8 343.7 484.9 343.7 505.9C343.7 526.9 360.8 544 381.8 544C402.8 544 419.9 526.9 419.9 505.9C419.9 484.9 402.8 467.8 381.8 467.8zM467.9 505.9C467.9 526.9 485 544 506 544C527 544 544.1 526.9 544.1 505.9C544.1 484.9 527 467.8 506 467.8C485 467.8 467.9 484.9 467.9 505.9z"/></svg>
                    <span>+ 12% so với tháng trước</span>
                </h5>
            </div>
            <div className="all-order">
                <h3>Tổng đơn hàng tháng này</h3>
                <p>75</p>
                <h5>
                    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 640 640"><path d="M160 96C142.3 96 128 110.3 128 128C128 145.7 142.3 160 160 160L178.7 160L73.4 265.4C60.9 277.9 60.9 298.2 73.4 310.7C85.9 323.2 106.2 323.2 118.7 310.7L224 205.3L224 224C224 241.7 238.3 256 256 256C273.7 256 288 241.7 288 224L288 128C288 110.3 273.7 96 256 96L160 96zM467.8 134.1C467.8 155.1 484.9 172.2 505.9 172.2C526.9 172.2 544 155.1 544 134.1C544 113.1 526.9 96 505.9 96C484.9 96 467.8 113.1 467.8 134.1zM343.7 258.2C343.7 279.2 360.8 296.3 381.8 296.3C402.8 296.3 419.9 279.2 419.9 258.2C419.9 237.2 402.8 220.1 381.8 220.1C360.8 220.1 343.7 237.2 343.7 258.2zM505.9 220.1C484.9 220.1 467.8 237.2 467.8 258.2C467.8 279.2 484.9 296.3 505.9 296.3C526.9 296.3 544 279.2 544 258.2C544 237.2 526.9 220.1 505.9 220.1zM220.2 381.8C220.2 402.8 237.3 419.9 258.3 419.9C279.3 419.9 296.4 402.8 296.4 381.8C296.4 360.8 279.3 343.7 258.3 343.7C237.3 343.7 220.2 360.8 220.2 381.8zM381.8 343.7C360.8 343.7 343.7 360.8 343.7 381.8C343.7 402.8 360.8 419.9 381.8 419.9C402.8 419.9 419.9 402.8 419.9 381.8C419.9 360.8 402.8 343.7 381.8 343.7zM467.9 381.8C467.9 402.8 485 419.9 506 419.9C527 419.9 544.1 402.8 544.1 381.8C544.1 360.8 527 343.7 506 343.7C485 343.7 467.9 360.8 467.9 381.8zM134.1 467.8C113.1 467.8 96 484.9 96 505.9C96 526.9 113.1 544 134.1 544C155.1 544 172.2 526.9 172.2 505.9C172.2 484.9 155.1 467.8 134.1 467.8zM220.2 505.9C220.2 526.9 237.3 544 258.3 544C279.3 544 296.4 526.9 296.4 505.9C296.4 484.9 279.3 467.8 258.3 467.8C237.3 467.8 220.2 484.9 220.2 505.9zM381.8 467.8C360.8 467.8 343.7 484.9 343.7 505.9C343.7 526.9 360.8 544 381.8 544C402.8 544 419.9 526.9 419.9 505.9C419.9 484.9 402.8 467.8 381.8 467.8zM467.9 505.9C467.9 526.9 485 544 506 544C527 544 544.1 526.9 544.1 505.9C544.1 484.9 527 467.8 506 467.8C485 467.8 467.9 484.9 467.9 505.9z"/></svg>
                    <span>+ 8% so với tháng trước</span>
                </h5>
            </div>
            <div className="average-order">
                <h3>Giá trị TB tất cả đơn hàng</h3>
                <p>₫64K</p>
                <h5>
                    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 640 640"><path d="M160 96C142.3 96 128 110.3 128 128C128 145.7 142.3 160 160 160L178.7 160L73.4 265.4C60.9 277.9 60.9 298.2 73.4 310.7C85.9 323.2 106.2 323.2 118.7 310.7L224 205.3L224 224C224 241.7 238.3 256 256 256C273.7 256 288 241.7 288 224L288 128C288 110.3 273.7 96 256 96L160 96zM467.8 134.1C467.8 155.1 484.9 172.2 505.9 172.2C526.9 172.2 544 155.1 544 134.1C544 113.1 526.9 96 505.9 96C484.9 96 467.8 113.1 467.8 134.1zM343.7 258.2C343.7 279.2 360.8 296.3 381.8 296.3C402.8 296.3 419.9 279.2 419.9 258.2C419.9 237.2 402.8 220.1 381.8 220.1C360.8 220.1 343.7 237.2 343.7 258.2zM505.9 220.1C484.9 220.1 467.8 237.2 467.8 258.2C467.8 279.2 484.9 296.3 505.9 296.3C526.9 296.3 544 279.2 544 258.2C544 237.2 526.9 220.1 505.9 220.1zM220.2 381.8C220.2 402.8 237.3 419.9 258.3 419.9C279.3 419.9 296.4 402.8 296.4 381.8C296.4 360.8 279.3 343.7 258.3 343.7C237.3 343.7 220.2 360.8 220.2 381.8zM381.8 343.7C360.8 343.7 343.7 360.8 343.7 381.8C343.7 402.8 360.8 419.9 381.8 419.9C402.8 419.9 419.9 402.8 419.9 381.8C419.9 360.8 402.8 343.7 381.8 343.7zM467.9 381.8C467.9 402.8 485 419.9 506 419.9C527 419.9 544.1 402.8 544.1 381.8C544.1 360.8 527 343.7 506 343.7C485 343.7 467.9 360.8 467.9 381.8zM134.1 467.8C113.1 467.8 96 484.9 96 505.9C96 526.9 113.1 544 134.1 544C155.1 544 172.2 526.9 172.2 505.9C172.2 484.9 155.1 467.8 134.1 467.8zM220.2 505.9C220.2 526.9 237.3 544 258.3 544C279.3 544 296.4 526.9 296.4 505.9C296.4 484.9 279.3 467.8 258.3 467.8C237.3 467.8 220.2 484.9 220.2 505.9zM381.8 467.8C360.8 467.8 343.7 484.9 343.7 505.9C343.7 526.9 360.8 544 381.8 544C402.8 544 419.9 526.9 419.9 505.9C419.9 484.9 402.8 467.8 381.8 467.8zM467.9 505.9C467.9 526.9 485 544 506 544C527 544 544.1 526.9 544.1 505.9C544.1 484.9 527 467.8 506 467.8C485 467.8 467.9 484.9 467.9 505.9z"/></svg>
                    <span>+ 3% so với tháng trước</span>
                </h5>
            </div>
            <div className="rate-increase">
                <h3>Đánh giá chất lượng dịch vụ</h3>
                <p>3.2%</p>
                <h5>
                    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 640 640"><path d="M160 96C142.3 96 128 110.3 128 128C128 145.7 142.3 160 160 160L178.7 160L73.4 265.4C60.9 277.9 60.9 298.2 73.4 310.7C85.9 323.2 106.2 323.2 118.7 310.7L224 205.3L224 224C224 241.7 238.3 256 256 256C273.7 256 288 241.7 288 224L288 128C288 110.3 273.7 96 256 96L160 96zM467.8 134.1C467.8 155.1 484.9 172.2 505.9 172.2C526.9 172.2 544 155.1 544 134.1C544 113.1 526.9 96 505.9 96C484.9 96 467.8 113.1 467.8 134.1zM343.7 258.2C343.7 279.2 360.8 296.3 381.8 296.3C402.8 296.3 419.9 279.2 419.9 258.2C419.9 237.2 402.8 220.1 381.8 220.1C360.8 220.1 343.7 237.2 343.7 258.2zM505.9 220.1C484.9 220.1 467.8 237.2 467.8 258.2C467.8 279.2 484.9 296.3 505.9 296.3C526.9 296.3 544 279.2 544 258.2C544 237.2 526.9 220.1 505.9 220.1zM220.2 381.8C220.2 402.8 237.3 419.9 258.3 419.9C279.3 419.9 296.4 402.8 296.4 381.8C296.4 360.8 279.3 343.7 258.3 343.7C237.3 343.7 220.2 360.8 220.2 381.8zM381.8 343.7C360.8 343.7 343.7 360.8 343.7 381.8C343.7 402.8 360.8 419.9 381.8 419.9C402.8 419.9 419.9 402.8 419.9 381.8C419.9 360.8 402.8 343.7 381.8 343.7zM467.9 381.8C467.9 402.8 485 419.9 506 419.9C527 419.9 544.1 402.8 544.1 381.8C544.1 360.8 527 343.7 506 343.7C485 343.7 467.9 360.8 467.9 381.8zM134.1 467.8C113.1 467.8 96 484.9 96 505.9C96 526.9 113.1 544 134.1 544C155.1 544 172.2 526.9 172.2 505.9C172.2 484.9 155.1 467.8 134.1 467.8zM220.2 505.9C220.2 526.9 237.3 544 258.3 544C279.3 544 296.4 526.9 296.4 505.9C296.4 484.9 279.3 467.8 258.3 467.8C237.3 467.8 220.2 484.9 220.2 505.9zM381.8 467.8C360.8 467.8 343.7 484.9 343.7 505.9C343.7 526.9 360.8 544 381.8 544C402.8 544 419.9 526.9 419.9 505.9C419.9 484.9 402.8 467.8 381.8 467.8zM467.9 505.9C467.9 526.9 485 544 506 544C527 544 544.1 526.9 544.1 505.9C544.1 484.9 527 467.8 506 467.8C485 467.8 467.9 484.9 467.9 505.9z"/></svg>
                    <span>+ 0.5% so với tháng trước</span>
                </h5>
            </div>
        </div>

        <div className='chart'>
            <div className='chart-1'>
              {range === 'Tuần' && <PolarArea data={dataByWeek} options={commonOptions as ChartOptions<'polarArea'>} />}
              {range === 'Tháng' && <Bar data={dataByMonth} options={commonOptions as ChartOptions<'bar'>} />}
              {range === 'Năm' && <Line data={dataByYear} options={commonOptions as ChartOptions<'line'>} />}
              <div className='chart-title'>
                <h3>{getChartTitle()}</h3>
              </div>
            </div>
            <div className='chart-2'>
              {range === 'Tuần' && <Doughnut data={dataByWeekVenue} options={commonOptions as ChartOptions<'doughnut'>} />}
              {range === 'Tháng' && <Bar data={dataByMonthVenue} options={commonOptions as ChartOptions<'bar'>} />}
              {range === 'Năm' && <Line data={dataByYearVenue} options={commonOptions as ChartOptions<'line'>} />}
              <div className='chart-title'>
                <h3>{getChartTitle2()}</h3>
              </div>
            </div>
        </div>
      </div>
      <div className='content-bottom-report'>
          <div className="top-selling-products">
            <h3>Sản phẩm bán chạy nhất</h3>
            <p className="sub-title">Top 4 sản phẩm có doanh số cao nhất</p>

            <div className="product-item">
              <div className="rank">1</div>
              <div className="details">
                <h4>Hoa Hồng Đỏ</h4>
                <p>245 lượt bán</p>
              </div>
              <div className="revenue">₫36.75M<br /><span>Doanh thu</span></div>
            </div>

            <div className="product-item">
              <div className="rank">2</div>
              <div className="details">
                <h4>Hoa Tulip Trắng</h4>
                <p>189 lượt bán</p>
              </div>
              <div className="revenue">₫22.68M<br /><span>Doanh thu</span></div>
            </div>

            <div className="product-item">
              <div className="rank">3</div>
              <div className="details">
                <h4>Hoa Cúc Vàng</h4>
                <p>156 lượt bán</p>
              </div>
              <div className="revenue">₫12.48M<br /><span>Doanh thu</span></div>
            </div>

            <div className="product-item">
              <div className="rank">4</div>
              <div className="details">
                <h4>Hoa Ly Trắng</h4>
                <p>98 lượt bán</p>
              </div>
              <div className="revenue">₫19.6M<br /><span>Doanh thu</span></div>
            </div>
          </div>
      </div>
    </>
  );
}

export default ReportSummarize;
