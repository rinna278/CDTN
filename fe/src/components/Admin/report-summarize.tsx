import "./report-summarize.css";
import React, { useEffect, useState } from "react";
import { ChartOptions } from "chart.js";
import {
  getAllStatisticDashboard,
} from "../../services/apiService";
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
} from "chart.js";
import { Bar, Line } from "react-chartjs-2";
import ChartDataLabels from "chartjs-plugin-datalabels";
import { formatCurrency } from "../../utils/formatData";
import { TopCategory } from "../../types/type";

ChartJS.register(ChartDataLabels);
ChartJS.register(
  CategoryScale,
  LinearScale,
  BarElement,
  PointElement,
  LineElement,
  RadialLinearScale,
  ArcElement,
  Tooltip,
  Legend,
);

interface ChartDataItem {
  date: string;
  orderCount: number;
  revenue: number;
}


const ReportSummarize = () => {
  const [showModal, setShowModal] = useState(false);
  const [range, setRange] = useState("Tháng");
  const [totalOrders, setTotalOrders] = useState(0);
  const [totalRevenue, setTotalRevenue] = useState(0);
  const [totalAverageOrders, setTotalAverageOrders] = useState(0);
  const [percentChangeRevenue, setPercentChangeRevenue] = useState(0);
  const [percentChangeOrders, setPercentChangeOrders] = useState(0);
  const [percentaverageOrders, setPercentAverageOrders] = useState(0);

  // State cho dữ liệu biểu đồ
  const [orderChartData, setOrderChartData] = useState<ChartDataItem[]>([]);
  const [revenueChartData, setRevenueChartData] = useState<ChartDataItem[]>([]);
  const [topCategories, setTopCategories] = useState<TopCategory[]>([]);

  //Biểu đồ theo năm/tháng
  const currentDate = new Date();

  const [selectedMonth, setSelectedMonth] = useState<number>(
    currentDate.getMonth() + 1,
  );
  const [selectedYear, setSelectedYear] = useState<number>(
    currentDate.getFullYear(),
  );

  const handleTimeButtonClick = () => {
    setShowModal(!showModal);
  };

  const handleSelectRange = (selectedRange: string) => {
    setRange(selectedRange);
    setShowModal(false);
  };


  useEffect(() => {
    const fetchStatistic = async () => {
      const response = await getAllStatisticDashboard(
        range === "Tháng" ? selectedMonth : undefined,
        selectedYear,
      );
      setTotalRevenue(response?.revenueStats.currentMonth);
      setTotalOrders(response?.orderStats.currentMonth);
      setTotalAverageOrders(response?.averageOrderValue.value);
      setPercentChangeRevenue(response?.revenueStats?.percentageChange || 0);
      setPercentChangeOrders(response?.orderStats?.percentageChange || 0);
      setPercentAverageOrders(
        response?.averageOrderValue?.percentageChange || 0,
      );

      setOrderChartData(response?.dailyOrderChart || []);
      setRevenueChartData(response?.dailyRevenueChart || []);
      setTopCategories((response?.topCategories || []).slice(0, 4));

    };

    fetchStatistic();
  }, [range, selectedMonth, selectedYear]);


  // Hàm xử lý dữ liệu theo tháng (từ dailyChart)
 const processMonthlyData = (data: ChartDataItem[]) => {
   const today = new Date();

   const isCurrentMonth =
     selectedYear === today.getFullYear() &&
     selectedMonth === today.getMonth() + 1;

   const daysInMonth = new Date(selectedYear, selectedMonth, 0).getDate();

   const maxDay = isCurrentMonth ? today.getDate() : daysInMonth;

   const result: {
     [key: string]: { orderCount: number; revenue: number };
   } = {};

   // 1️⃣ Fill ngày hợp lệ
   for (let day = 1; day <= maxDay; day++) {
     result[`${day}/${selectedMonth}`] = {
       orderCount: 0,
       revenue: 0,
     };
   }

   // 2️⃣ Gán dữ liệu API (KHÔNG dùng Date() trực tiếp)
   data.forEach((item) => {
     const [year, month, day] = item.date.split("-").map(Number);

     if (year === selectedYear && month === selectedMonth && day <= maxDay) {
       result[`${day}/${month}`] = {
         orderCount: item.orderCount,
         revenue: item.revenue,
       };
     }
   });

   return result;
 };


  // Hàm xử lý dữ liệu theo năm (cần API khác hoặc aggregate từ dữ liệu có)
  const processYearlyData = () => {
    // Giả sử bạn cần gọi API khác để lấy dữ liệu theo năm
    // Tạm thời return dữ liệu mẫu 12 tháng
    const months = Array.from({ length: 12 }, (_, i) => ({
      label: `Th${i + 1}`,
      orderCount: 0,
      revenue: 0,
    }));

    // Nếu có dữ liệu, aggregate theo tháng
    orderChartData.forEach((item) => {
      const date = new Date(item.date);
      const monthIndex = date.getMonth();
      if (monthIndex >= 0 && monthIndex < 12) {
        months[monthIndex].orderCount += item.orderCount;
        months[monthIndex].revenue += item.revenue;
      }
    });

    return months.reduce(
      (acc, item) => {
        acc[item.label] = {
          orderCount: item.orderCount,
          revenue: item.revenue,
        };
        return acc;
      },
      {} as { [key: string]: { orderCount: number; revenue: number } },
    );
  };

  // Tạo dữ liệu cho biểu đồ đơn hàng
  const getOrderChartData = () => {
    let processedData: {
      [key: string]: { orderCount: number; revenue: number };
    } = {};

    switch (range) {
      case "Tháng":
        processedData = processMonthlyData(orderChartData);
        break;
      case "Năm":
        processedData = processYearlyData();
        break;
      default:
        processedData = processMonthlyData(orderChartData);
    }

    const labels = Object.keys(processedData);
    const data = Object.values(processedData).map((item) => item.orderCount);

    return {
      labels,
      datasets: [
        {
          label: "Số lượng đơn hàng (đvt: đơn)",
          data,
          backgroundColor:
            range === "Năm" ? "rgba(54, 162, 235, 0.3)" : "#36A2EB",
          borderColor: range === "Năm" ? "#36A2EB" : undefined,
          tension: range === "Năm" ? 0.4 : undefined,
          fill: range === "Năm" ? true : undefined,
        },
      ],
    };
  };


  const getNiceMax = (data: number[]) => {
    const max = Math.max(...data, 0);

    if (max <= 5) return 5;
    if (max <= 10) return 10;
    if (max <= 20) return 20;

    // Làm tròn lên bội số đẹp (10, 20, 50…)
    const magnitude = Math.pow(10, Math.floor(Math.log10(max)));
    return Math.ceil(max / magnitude) * magnitude;
  };
  
  // Tạo dữ liệu cho biểu đồ doanh thu
  const getRevenueChartData = () => {
    let processedData: {
      [key: string]: { orderCount: number; revenue: number };
    } = {};

    switch (range) {
      case "Tháng":
        processedData = processMonthlyData(revenueChartData);
        break;
      case "Năm":
        processedData = processYearlyData();
        break;
      default:
        processedData = processMonthlyData(revenueChartData);
    }

    const labels = Object.keys(processedData);
    const data = Object.values(processedData).map(
      (item) => item.revenue / 1_000_000,
    );

    const suggestedMax = getNiceMax(data);

    return {
      labels,
      datasets: [
        {
          label: "Tổng doanh thu (đvt: triệu VND)",
          data,
          backgroundColor:
            range === "Năm" ? "rgba(32, 192, 173, 0.3)" : "#20c0adff",
          borderColor: range === "Năm" ? "#20c0adff" : undefined,
          tension: range === "Năm" ? 0.4 : undefined,
          fill: range === "Năm",
        },
      ],
      suggestedMax, // 👈 dùng bên options
    };
  };
  const revenueChart = getRevenueChartData();



const getCommonOptions = (
  suggestedMax?: number,
): ChartOptions<"bar" | "line"> => ({
  plugins: {
    legend: {
      display: true,
      labels: {
        color: "#333",
        font: { size: 14 },
      },
    },
    datalabels: {
      color: "#111",
      anchor: "end",
      align: "end",
      offset: 4,
      font: {
        weight: "bold",
        size: 12,
      },
      formatter: (value: number) => (value === 0 ? "" : Math.round(value)),
    },
  },
  scales: {
    y: {
      beginAtZero: true,
      suggestedMax,
      ticks: {
        stepSize: suggestedMax && suggestedMax <= 10 ? 2 : undefined,
      },
      grid: {
        color: "#eee",
      },
      border: {
        display: false, // ✅ thay cho drawBorder
      },
    },
    x: {
      grid: {
        display: false,
      },
      border: {
        display: false,
      },
    },
  },
});




  // const getChartTitle = () => {
  //   switch (range) {
  //     case "Tháng":
  //       return "Biểu đồ thể hiện số lượng đơn hàng theo Ngày";
  //     case "Năm":
  //       return "Biểu đồ thể hiện số lượng đơn hàng theo Tháng";
  //     default:
  //       return "Biểu đồ thể hiện số lượng Đơn hàng";
  //   }
  // };

  const getChartTitle2 = () => {
    switch (range) {
      case "Tháng":
        return "Biểu đồ thể hiện tổng doanh thu theo Ngày";
      case "Năm":
        return "Biểu đồ thể hiện tổng doanh thu theo Tháng";
      default:
        return "Biểu đồ thể hiện tổng Doanh thu";
    }
  };

  return (
    <>
      <div className="content-top-report">
        <div className="title_description">
          <h1>Quản Lý Sản Phẩm</h1>
          <h5>Quản lý danh sách hoa và danh mục</h5>
        </div>
        <div className="btn-select-time">
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
              <button
                className="modal-tab-btn"
                onClick={() => handleSelectRange("Tháng")}
              >
                Tháng
              </button>
              <button
                className="modal-tab-btn"
                onClick={() => handleSelectRange("Năm")}
              >
                Năm
              </button>
            </div>
          )}
        </div>
      </div>

      <div className="content-middle-report">
        <div className="item-report">
          <div className="venue-month">
            <h3>Doanh thu tháng này</h3>
            <p>{formatCurrency(totalRevenue)}</p>
            <h5>
              <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 640 640">
                <path d="M160 96C142.3 96 128 110.3 128 128C128 145.7 142.3 160 160 160L178.7 160L73.4 265.4C60.9 277.9 60.9 298.2 73.4 310.7C85.9 323.2 106.2 323.2 118.7 310.7L224 205.3L224 224C224 241.7 238.3 256 256 256C273.7 256 288 241.7 288 224L288 128C288 110.3 273.7 96 256 96L160 96zM467.8 134.1C467.8 155.1 484.9 172.2 505.9 172.2C526.9 172.2 544 155.1 544 134.1C544 113.1 526.9 96 505.9 96C484.9 96 467.8 113.1 467.8 134.1zM343.7 258.2C343.7 279.2 360.8 296.3 381.8 296.3C402.8 296.3 419.9 279.2 419.9 258.2C419.9 237.2 402.8 220.1 381.8 220.1C360.8 220.1 343.7 237.2 343.7 258.2zM505.9 220.1C484.9 220.1 467.8 237.2 467.8 258.2C467.8 279.2 484.9 296.3 505.9 296.3C526.9 296.3 544 279.2 544 258.2C544 237.2 526.9 220.1 505.9 220.1zM220.2 381.8C220.2 402.8 237.3 419.9 258.3 419.9C279.3 419.9 296.4 402.8 296.4 381.8C296.4 360.8 279.3 343.7 258.3 343.7C237.3 343.7 220.2 360.8 220.2 381.8zM381.8 343.7C360.8 343.7 343.7 360.8 343.7 381.8C343.7 402.8 360.8 419.9 381.8 419.9C402.8 419.9 419.9 402.8 419.9 381.8C419.9 360.8 402.8 343.7 381.8 343.7zM467.9 381.8C467.9 402.8 485 419.9 506 419.9C527 419.9 544.1 402.8 544.1 381.8C544.1 360.8 527 343.7 506 343.7C485 343.7 467.9 360.8 467.9 381.8zM134.1 467.8C113.1 467.8 96 484.9 96 505.9C96 526.9 113.1 544 134.1 544C155.1 544 172.2 526.9 172.2 505.9C172.2 484.9 155.1 467.8 134.1 467.8zM220.2 505.9C220.2 526.9 237.3 544 258.3 544C279.3 544 296.4 526.9 296.4 505.9C296.4 484.9 279.3 467.8 258.3 467.8C237.3 467.8 220.2 484.9 220.2 505.9zM381.8 467.8C360.8 467.8 343.7 484.9 343.7 505.9C343.7 526.9 360.8 544 381.8 544C402.8 544 419.9 526.9 419.9 505.9C419.9 484.9 402.8 467.8 381.8 467.8zM467.9 505.9C467.9 526.9 485 544 506 544C527 544 544.1 526.9 544.1 505.9C544.1 484.9 527 467.8 506 467.8C485 467.8 467.9 484.9 467.9 505.9z" />
              </svg>
              <span>
                {percentChangeRevenue >= 0 ? "+" : ""} {percentChangeRevenue}%
                so với tháng trước
              </span>
            </h5>
          </div>
          <div className="all-order">
            <h3>Tổng đơn hàng tháng này</h3>
            <p>{totalOrders}</p>
            <h5>
              <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 640 640">
                <path d="M160 96C142.3 96 128 110.3 128 128C128 145.7 142.3 160 160 160L178.7 160L73.4 265.4C60.9 277.9 60.9 298.2 73.4 310.7C85.9 323.2 106.2 323.2 118.7 310.7L224 205.3L224 224C224 241.7 238.3 256 256 256C273.7 256 288 241.7 288 224L288 128C288 110.3 273.7 96 256 96L160 96zM467.8 134.1C467.8 155.1 484.9 172.2 505.9 172.2C526.9 172.2 544 155.1 544 134.1C544 113.1 526.9 96 505.9 96C484.9 96 467.8 113.1 467.8 134.1zM343.7 258.2C343.7 279.2 360.8 296.3 381.8 296.3C402.8 296.3 419.9 279.2 419.9 258.2C419.9 237.2 402.8 220.1 381.8 220.1C360.8 220.1 343.7 237.2 343.7 258.2zM505.9 220.1C484.9 220.1 467.8 237.2 467.8 258.2C467.8 279.2 484.9 296.3 505.9 296.3C526.9 296.3 544 279.2 544 258.2C544 237.2 526.9 220.1 505.9 220.1zM220.2 381.8C220.2 402.8 237.3 419.9 258.3 419.9C279.3 419.9 296.4 402.8 296.4 381.8C296.4 360.8 279.3 343.7 258.3 343.7C237.3 343.7 220.2 360.8 220.2 381.8zM381.8 343.7C360.8 343.7 343.7 360.8 343.7 381.8C343.7 402.8 360.8 419.9 381.8 419.9C402.8 419.9 419.9 402.8 419.9 381.8C419.9 360.8 402.8 343.7 381.8 343.7zM467.9 381.8C467.9 402.8 485 419.9 506 419.9C527 419.9 544.1 402.8 544.1 381.8C544.1 360.8 527 343.7 506 343.7C485 343.7 467.9 360.8 467.9 381.8zM134.1 467.8C113.1 467.8 96 484.9 96 505.9C96 526.9 113.1 544 134.1 544C155.1 544 172.2 526.9 172.2 505.9C172.2 484.9 155.1 467.8 134.1 467.8zM220.2 505.9C220.2 526.9 237.3 544 258.3 544C279.3 544 296.4 526.9 296.4 505.9C296.4 484.9 279.3 467.8 258.3 467.8C237.3 467.8 220.2 484.9 220.2 505.9zM381.8 467.8C360.8 467.8 343.7 484.9 343.7 505.9C343.7 526.9 360.8 544 381.8 544C402.8 544 419.9 526.9 419.9 505.9C419.9 484.9 402.8 467.8 381.8 467.8zM467.9 505.9C467.9 526.9 485 544 506 544C527 544 544.1 526.9 544.1 505.9C544.1 484.9 527 467.8 506 467.8C485 467.8 467.9 484.9 467.9 505.9z" />
              </svg>
              <span>
                {percentChangeOrders >= 0 ? "+" : ""} {percentChangeOrders}% so
                với tháng trước
              </span>
            </h5>
          </div>
          <div className="average-order">
            <h3>Giá trị TB tất cả đơn hàng</h3>
            <p>{formatCurrency(totalAverageOrders)}</p>
            <h5>
              <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 640 640">
                <path d="M160 96C142.3 96 128 110.3 128 128C128 145.7 142.3 160 160 160L178.7 160L73.4 265.4C60.9 277.9 60.9 298.2 73.4 310.7C85.9 323.2 106.2 323.2 118.7 310.7L224 205.3L224 224C224 241.7 238.3 256 256 256C273.7 256 288 241.7 288 224L288 128C288 110.3 273.7 96 256 96L160 96zM467.8 134.1C467.8 155.1 484.9 172.2 505.9 172.2C526.9 172.2 544 155.1 544 134.1C544 113.1 526.9 96 505.9 96C484.9 96 467.8 113.1 467.8 134.1zM343.7 258.2C343.7 279.2 360.8 296.3 381.8 296.3C402.8 296.3 419.9 279.2 419.9 258.2C419.9 237.2 402.8 220.1 381.8 220.1C360.8 220.1 343.7 237.2 343.7 258.2zM505.9 220.1C484.9 220.1 467.8 237.2 467.8 258.2C467.8 279.2 484.9 296.3 505.9 296.3C526.9 296.3 544 279.2 544 258.2C544 237.2 526.9 220.1 505.9 220.1zM220.2 381.8C220.2 402.8 237.3 419.9 258.3 419.9C279.3 419.9 296.4 402.8 296.4 381.8C296.4 360.8 279.3 343.7 258.3 343.7C237.3 343.7 220.2 360.8 220.2 381.8zM381.8 343.7C360.8 343.7 343.7 360.8 343.7 381.8C343.7 402.8 360.8 419.9 381.8 419.9C402.8 419.9 419.9 402.8 419.9 381.8C419.9 360.8 402.8 343.7 381.8 343.7zM467.9 381.8C467.9 402.8 485 419.9 506 419.9C527 419.9 544.1 402.8 544.1 381.8C544.1 360.8 527 343.7 506 343.7C485 343.7 467.9 360.8 467.9 381.8zM134.1 467.8C113.1 467.8 96 484.9 96 505.9C96 526.9 113.1 544 134.1 544C155.1 544 172.2 526.9 172.2 505.9C172.2 484.9 155.1 467.8 134.1 467.8zM220.2 505.9C220.2 526.9 237.3 544 258.3 544C279.3 544 296.4 526.9 296.4 505.9C296.4 484.9 279.3 467.8 258.3 467.8C237.3 467.8 220.2 484.9 220.2 505.9zM381.8 467.8C360.8 467.8 343.7 484.9 343.7 505.9C343.7 526.9 360.8 544 381.8 544C402.8 544 419.9 526.9 419.9 505.9C419.9 484.9 402.8 467.8 381.8 467.8zM467.9 505.9C467.9 526.9 485 544 506 544C527 544 544.1 526.9 544.1 505.9C544.1 484.9 527 467.8 506 467.8C485 467.8 467.9 484.9 467.9 505.9z" />
              </svg>
              <span>
                {percentaverageOrders >= 0 ? "+" : ""} {percentaverageOrders}%
                so với tháng trước
              </span>
            </h5>
          </div>
        </div>

        <div className="chart">
          <div className="filter-time">
            {range === "Tháng" && (
              <select
                className="month-select"
                value={selectedMonth}
                onChange={(e) => setSelectedMonth(Number(e.target.value))}
              >
                {Array.from({ length: 12 }, (_, i) => (
                  <option key={i + 1} value={i + 1}>
                    Tháng {i + 1}
                  </option>
                ))}
              </select>
            )}

            <div className="year-select">
              <input
                type="number"
                min={2000}
                max={2100}
                value={selectedYear}
                onChange={(e) => setSelectedYear(Number(e.target.value))}
              />
            </div>
          </div>

          <div className="chart-2">
            {range === "Năm" ? (
              <Line
                data={revenueChart}
                options={
                  getCommonOptions(
                    revenueChart.suggestedMax,
                  ) as ChartOptions<"line">
                }
              />
            ) : (
              <Bar
                data={revenueChart}
                options={
                  getCommonOptions(
                    revenueChart.suggestedMax,
                  ) as ChartOptions<"bar">
                }
              />
            )}

            <div className="chart-title">
              <h3>{getChartTitle2()}</h3>
            </div>
          </div>
        </div>
      </div>
      <div className="content-bottom-report">
        <div className="top-selling-products">
          <h3>Danh mục bán chạy nhất</h3>
          <p className="sub-title">Top 4 danh mục có doanh số cao nhất</p>
          {topCategories.map((item) => (
            <div className="product-item" key={item.rank}>
              <div className="rank">{item.rank}</div>

              <div className="details">
                <h4>{item.categoryName}</h4>
                <p>{item.soldCount} lượt bán</p>
              </div>

              <div className="revenue">
                {formatCurrency(item.revenue)}
                <br />
                <span>Doanh thu</span>
              </div>
            </div>
          ))}
        </div>
      </div>
    </>
  );
};

export default ReportSummarize;
