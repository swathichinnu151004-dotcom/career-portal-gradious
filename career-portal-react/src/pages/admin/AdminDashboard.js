import { useEffect, useMemo, useState } from "react";
import { toast } from "react-toastify";
import Layout from "../../components/common/Layout";
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  BarElement,
  ArcElement,
  Tooltip,
  Legend,
} from "chart.js";
import { Bar, Doughnut } from "react-chartjs-2";
import {
  getAdminDashboardSummary,
  getUserApplicationStats,
} from "../../services/adminService";
import {
  chartFontFamily,
  niceAxisMax,
  tooltipDefaults,
} from "../../utils/chartTheme";
import "./AdminDashboard.css";

ChartJS.register(
  CategoryScale,
  LinearScale,
  BarElement,
  ArcElement,
  Tooltip,
  Legend
);

function AdminDashboard() {
  const [summary, setSummary] = useState({
    totalUsers: 0,
    totalRecruiters: 0,
    totalJobs: 0,
    totalApplications: 0,
  });

  const [loading, setLoading] = useState(true);
  const [userApplicationStats, setUserApplicationStats] = useState([]);

  useEffect(() => {
    loadDashboardSummary();
    loadUserApplicationStats();
  }, []);

  const loadDashboardSummary = async () => {
    try {
      const response = await getAdminDashboardSummary();

      setSummary({
        totalUsers: response?.data?.totalUsers || 0,
        totalRecruiters: response?.data?.totalRecruiters || 0,
        totalJobs: response?.data?.totalJobs || 0,
        totalApplications: response?.data?.totalApplications || 0,
      });
    } catch (error) {
      console.error("Error loading admin dashboard:", error);
      toast.error(
        error?.response?.data?.message || "Could not load admin dashboard."
      );
    } finally {
      setLoading(false);
    }
  };

  const loadUserApplicationStats = async () => {
    try {
      const response = await getUserApplicationStats();
      setUserApplicationStats(Array.isArray(response?.data) ? response.data : []);
    } catch (error) {
      console.error("Error loading user application stats:", error);
      setUserApplicationStats([]);
    }
  };

  const counts = useMemo(
    () => [
      summary.totalUsers,
      summary.totalRecruiters,
      summary.totalJobs,
      summary.totalApplications,
    ],
    [
      summary.totalApplications,
      summary.totalJobs,
      summary.totalRecruiters,
      summary.totalUsers,
    ]
  );

  const yAxisMax = useMemo(() => niceAxisMax(counts, 5), [counts]);

  const barData = {
    labels: ["Users", "Recruiters", "Jobs", "Applications"],
    datasets: [
      {
        label: "Records",
        data: counts,
        backgroundColor: [
          "rgba(59, 130, 246, 0.85)",
          "rgba(16, 185, 129, 0.85)",
          "rgba(249, 115, 22, 0.88)",
          "rgba(139, 92, 246, 0.85)",
        ],
        borderColor: "#ffffff",
        borderWidth: 1,
        borderRadius: 10,
        borderSkipped: false,
        maxBarThickness: 56,
      },
    ],
  };

  const doughnutData = {
    labels: ["Users", "Recruiters", "Jobs", "Applications"],
    datasets: [
      {
        data: counts,
        backgroundColor: ["#2563eb", "#0d9488", "#ea580c", "#7c3aed"],
        borderColor: "#ffffff",
        borderWidth: 3,
        hoverOffset: 6,
        spacing: 2,
      },
    ],
  };

  const barOptions = useMemo(
    () => ({
      responsive: true,
      maintainAspectRatio: false,
      interaction: { mode: "index", intersect: false },
      plugins: {
        legend: { display: false },
        tooltip: {
          ...tooltipDefaults,
          callbacks: {
            label: (ctx) => {
              const v = ctx.parsed?.y;
              return ` ${v?.toLocaleString?.() ?? v} records`;
            },
          },
        },
      },
      scales: {
        x: {
          grid: { display: false, drawBorder: false },
          ticks: {
            color: "#64748b",
            font: { size: 12, weight: "600", family: chartFontFamily },
          },
        },
        y: {
          beginAtZero: true,
          max: yAxisMax,
          grid: {
            color: "rgba(148, 163, 184, 0.2)",
            drawBorder: false,
          },
          ticks: {
            color: "#94a3b8",
            font: { size: 11, family: chartFontFamily },
            precision: 0,
            maxTicksLimit: 8,
          },
        },
      },
    }),
    [yAxisMax]
  );

  const doughnutOptions = useMemo(() => {
    const total = counts.reduce((a, b) => a + b, 0) || 1;
    return {
      responsive: true,
      maintainAspectRatio: false,
      cutout: "58%",
      layout: { padding: { top: 4, bottom: 4 } },
      plugins: {
        legend: {
          position: "bottom",
          labels: {
            usePointStyle: true,
            pointStyle: "circle",
            padding: 14,
            font: {
              size: 12,
              weight: "500",
              family: chartFontFamily,
            },
            color: "#475569",
            boxWidth: 8,
            boxHeight: 8,
          },
        },
        tooltip: {
          ...tooltipDefaults,
          callbacks: {
            label: (ctx) => {
              const n = Number(ctx.raw ?? 0);
              const pct = Math.round((n / total) * 100);
              return ` ${n.toLocaleString()} (${pct}% of total)`;
            },
          },
        },
      },
    };
  }, [counts]);

  return (
    <Layout>
      <div className="admin-dashboard-page">
        <header className="dash-page-intro">
          <h1 className="dash-page-title">Overview</h1>
          <p className="dash-page-desc">
            Snapshot of platform activity — counts update when you load or
            refresh this page.
          </p>
        </header>

        {loading ? (
          <div className="dashboard-loading" role="status" aria-live="polite">
            <span className="dash-loading-dot" aria-hidden />
            Loading dashboard data…
          </div>
        ) : (
          <>
            <div className="dashboard-cards dash-stat-grid">
              <div className="dashboard-card dash-stat-card">
                <p className="dash-stat-label">Total users</p>
                <h2 className="dash-stat-value">{summary.totalUsers}</h2>
              </div>

              <div className="dashboard-card dash-stat-card">
                <p className="dash-stat-label">Total recruiters</p>
                <h2 className="dash-stat-value">{summary.totalRecruiters}</h2>
              </div>

              <div className="dashboard-card dash-stat-card">
                <p className="dash-stat-label">Total jobs</p>
                <h2 className="dash-stat-value">{summary.totalJobs}</h2>
              </div>

              <div className="dashboard-card dash-stat-card">
                <p className="dash-stat-label">Total applications</p>
                <h2 className="dash-stat-value">{summary.totalApplications}</h2>
              </div>
            </div>

            <div className="admin-chart-grid">
              <div className="admin-chart-card dash-chart-panel">
                <div className="dash-chart-head">
                  <h3>Platform overview</h3>
                  <p>Compare volumes across core entities</p>
                </div>
                <div className="chart-box" aria-label="Bar chart of platform counts">
                  <Bar data={barData} options={barOptions} />
                </div>
              </div>

              <div className="admin-chart-card dash-chart-panel">
                <div className="dash-chart-head">
                  <h3>Distribution summary</h3>
                  <p>Share of each category relative to the whole</p>
                </div>
                <div className="chart-box" aria-label="Donut chart of platform mix">
                  <Doughnut data={doughnutData} options={doughnutOptions} />
                </div>
              </div>
            </div>

            <section className="admin-job-stats-panel dash-chart-panel">
              <div className="dash-chart-head">
                <h3>User-wise application insights</h3>
                <p>
                  Each user's applied jobs, selected (shortlisted), and rejected counts.
                </p>
              </div>
              {userApplicationStats.length === 0 ? (
                <p className="admin-job-stats-empty">
                  No user application stats available.
                </p>
              ) : (
                <div className="admin-job-stats-table-wrap">
                  <table className="admin-job-stats-table">
                    <thead>
                      <tr>
                        <th>User Name</th>
                        <th>Email</th>
                        <th>Applied Jobs</th>
                        <th>Selected</th>
                        <th>Rejected</th>
                      </tr>
                    </thead>
                    <tbody>
                      {userApplicationStats.map((item) => (
                        <tr key={item.user_id}>
                          <td>{item.user_name}</td>
                          <td>{item.email}</td>
                          <td>
                            <span className="admin-stat-pill pill-applied">
                              {item.applied_jobs}
                            </span>
                          </td>
                          <td>
                            <span className="admin-stat-pill pill-selected">
                              {item.shortlisted_jobs}
                            </span>
                          </td>
                          <td>
                            <span className="admin-stat-pill pill-rejected">
                              {item.rejected_jobs}
                            </span>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </section>
          </>
        )}
      </div>
    </Layout>
  );
}

export default AdminDashboard;