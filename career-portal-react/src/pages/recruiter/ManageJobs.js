import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { flushSync } from "react-dom";
import { toast } from "react-toastify";
import Layout from "../../components/common/Layout";
import ModalPortal from "../../components/common/ModalPortal";
import AppPortalToast from "../../components/common/AppPortalToast";
import DetailDrawer, {
  DetailDrawerField,
} from "../../components/common/DetailDrawer";
import TableIconActionButton, {
  TableIconActions,
} from "../../components/common/TableIconActionButton";
import "./ManageJobs.css";
import { getApiBaseUrl } from "../../utils/getApiBaseUrl";

function normalizeJobList(data) {
  if (!Array.isArray(data)) return [];
  return data.filter((item) => item != null && typeof item === "object");
}

function ManageRecruiterJobs() {
  const token = localStorage.getItem("token");

  const [jobs, setJobs] = useState([]);
  const [jobTitleSummary, setJobTitleSummary] = useState([]);
  const [search, setSearch] = useState("");
  const [selectedJobTitle, setSelectedJobTitle] = useState("");
  const tableSectionRef = useRef(null);

  const [viewJob, setViewJob] = useState(null);
  const [updateJob, setUpdateJob] = useState(null);
  const [deleteJobId, setDeleteJobId] = useState(null);

  const [portalToast, setPortalToast] = useState({
    show: false,
    message: "",
    type: "success",
  });

  useEffect(() => {
    const loadJobs = async () => {
      try {
        const res = await fetch(`${getApiBaseUrl}/recruiter/jobs`, {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });

        const data = await res.json().catch(() => []);
        if (!res.ok) {
          toast.error(
            (data && typeof data === "object" && data.message) ||
              "Failed to load jobs."
          );
          setJobs([]);
          return;
        }
        setJobs(normalizeJobList(data));
      } catch (err) {
        console.error("Load jobs error:", err);
        toast.error("Could not load jobs.");
        setJobs([]);
      }
    };

    loadJobs();
  }, [token]);

  const showToast = (message, type = "success") => {
    flushSync(() => {
      setPortalToast({ show: true, message, type });
    });
    setTimeout(() => {
      setPortalToast({ show: false, message: "", type: "success" });
    }, 3000);
  };

  const reloadJobs = async () => {
    try {
      const res = await fetch(`${getApiBaseUrl}/recruiter/jobs`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      const data = await res.json().catch(() => []);
      if (!res.ok) {
        toast.error(
          (data && typeof data === "object" && data.message) ||
            "Failed to refresh jobs."
        );
        return;
      }
      setJobs(normalizeJobList(data));
    } catch (err) {
      console.error("Reload jobs error:", err);
      toast.error("Could not refresh jobs.");
    }
  };

  const searchedJobs = jobs.filter((job) => {
    if (!job) return false;
    const text = `${job.job_title || ""} ${job.department || ""} ${
      job.status || ""
    }`.toLowerCase();
    return text.includes(search.toLowerCase());
  });

  const filteredJobs = searchedJobs.filter((job) => {
    if (!selectedJobTitle) return true;
    return (
      String(job?.job_title || "").trim().toLowerCase() ===
      selectedJobTitle.trim().toLowerCase()
    );
  });

  const fallbackTitleSummary = useMemo(() => {
    const grouped = new Map();

    for (const job of searchedJobs) {
      const title = String(job?.job_title || "").trim() || "Untitled Job";
      const key = title.toLowerCase();

      if (!grouped.has(key)) {
        grouped.set(key, {
          job_title: title,
          total_jobs: 0,
          active_openings: 0,
        });
      }

      const item = grouped.get(key);
      item.total_jobs += 1;

      if (String(job?.status || "").toUpperCase() === "ACTIVE") {
        const openings = Number.parseInt(job?.openings, 10);
        item.active_openings +=
          Number.isFinite(openings) && openings > 0 ? openings : 1;
      }
    }

    return Array.from(grouped.values()).sort(
      (a, b) =>
        Number(b.total_jobs || 0) - Number(a.total_jobs || 0) ||
        String(a.job_title || "").localeCompare(String(b.job_title || ""))
    );
  }, [searchedJobs]);

  const effectiveTitleSummary =
    jobTitleSummary.length > 0 ? jobTitleSummary : fallbackTitleSummary;

  useEffect(() => {
    if (!selectedJobTitle) return;
    const exists = effectiveTitleSummary.some(
      (item) =>
        String(item?.job_title || "").trim().toLowerCase() ===
        selectedJobTitle.trim().toLowerCase()
    );
    if (!exists) setSelectedJobTitle("");
  }, [effectiveTitleSummary, selectedJobTitle]);

  useEffect(() => {
    if (!selectedJobTitle) return;
    tableSectionRef.current?.scrollIntoView({
      behavior: "smooth",
      block: "start",
    });
  }, [selectedJobTitle]);

  const loadJobTitleSummary = useCallback(
    async (searchTerm = "") => {
      try {
        const q = String(searchTerm || "").trim();
        const url = q
          ? `${getApiBaseUrl}/recruiter/jobs/title-summary?search=${encodeURIComponent(q)}`
          : `${getApiBaseUrl}/recruiter/jobs/title-summary`;

        const res = await fetch(url, {
          headers: { Authorization: `Bearer ${token}` },
        });
        const data = await res.json().catch(() => []);
        if (!res.ok) {
          setJobTitleSummary([]);
          return;
        }
        setJobTitleSummary(Array.isArray(data) ? data : []);
      } catch (err) {
        console.error("Load job title summary error:", err);
        setJobTitleSummary([]);
      }
    },
    [token]
  );

  useEffect(() => {
    const timer = setTimeout(() => {
      void loadJobTitleSummary(search);
    }, 250);
    return () => clearTimeout(timer);
  }, [search, loadJobTitleSummary]);

  const handleUpdateSubmit = async (e) => {
    e.preventDefault();
    if (!updateJob) return;

    try {
      const openingsValue = Number.parseInt(updateJob.openings, 10);
      if (!Number.isFinite(openingsValue) || openingsValue < 1) {
        showToast("Openings must be a whole number greater than 0", "error");
        return;
      }

      const payload = {
        job_title: updateJob.job_title?.trim() || "",
        department: updateJob.department?.trim() || "",
        location: updateJob.location?.trim() || "",
        experience: updateJob.experience?.trim() || "",
        openings: openingsValue,
        status: updateJob.status?.trim() || "ACTIVE",
        description: updateJob.description?.trim() || "",
      };

      const res = await fetch(
        `${getApiBaseUrl}/recruiter/jobs/${updateJob.id}`,
        {
          method: "PUT",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify(payload),
        }
      );

      const data = await res.json();

      if (!res.ok) {
        showToast(data.message || "Failed to update job", "error");
        return;
      }

      setUpdateJob(null);
      showToast(data.message || "Job updated successfully", "success");
      void reloadJobs();
    } catch (err) {
      console.error("Update job error:", err);
      showToast("Server error while updating job", "error");
    }
  };

  const handleDelete = async () => {
    if (!deleteJobId) return;

    try {
      const res = await fetch(
        `${getApiBaseUrl}/recruiter/jobs/${deleteJobId}`,
        {
          method: "DELETE",
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      const data = await res.json();

      if (!res.ok) {
        showToast(data.message || "Failed to delete job", "error");
        return;
      }

      setDeleteJobId(null);
      showToast(data.message || "Job deleted successfully", "success");
      void reloadJobs();
    } catch (err) {
      console.error("Delete job error:", err);
      showToast("Server error while deleting job", "error");
    }
  };

  const formatDate = (date) => {
    if (!date) return "-";
    return String(date).split("T")[0];
  };

  return (
    <Layout
      role="recruiter"
      title="Jobs"
      subtitle="Post and manage your jobs"
    >
      <section className="jobs-section">
        <div className="jobs-head">
          <input
            type="text"
            placeholder="Search job title or department"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>

        <div className="job-title-summary">
          <div className="job-title-summary-head">
            <h3>Jobs by title</h3>
            <p>
              Total postings and currently active openings for each job title
            </p>
          </div>

          {effectiveTitleSummary.length === 0 ? (
            <p className="job-title-empty">No job title summary available.</p>
          ) : (
            <div className="job-title-grid">
              {effectiveTitleSummary.map((item) => {
                const isSelected =
                  String(item?.job_title || "").trim().toLowerCase() ===
                  selectedJobTitle.trim().toLowerCase();
                return (
                <div
                  key={item.job_title}
                  className={`job-title-card ${isSelected ? "active" : ""}`}
                  onClick={() =>
                    setSelectedJobTitle((prev) =>
                      String(prev || "").trim().toLowerCase() ===
                      String(item?.job_title || "").trim().toLowerCase()
                        ? ""
                        : item.job_title
                    )
                  }
                  role="button"
                  tabIndex={0}
                  onKeyDown={(e) => {
                    if (e.key === "Enter" || e.key === " ") {
                      e.preventDefault();
                      setSelectedJobTitle((prev) =>
                        String(prev || "").trim().toLowerCase() ===
                        String(item?.job_title || "").trim().toLowerCase()
                          ? ""
                          : item.job_title
                      );
                    }
                  }}
                  title="Click to filter table by this job title"
                >
                  <h4>{item.job_title}</h4>
                  <div className="job-title-metrics">
                    <span>{item.total_jobs} job(s)</span>
                    <span>{item.active_openings} opening(s)</span>
                  </div>
                </div>
                );
              })}
            </div>
          )}
          {selectedJobTitle ? (
            <div className="selected-title-filter">
              Showing table rows for: <strong>{selectedJobTitle}</strong>
              <button
                type="button"
                className="clear-title-filter"
                onClick={() => setSelectedJobTitle("")}
              >
                Clear
              </button>
            </div>
          ) : null}
        </div>

        <div className="table-wrapper" ref={tableSectionRef}>
          <table className="jobs-table">
            <thead>
              <tr>
                <th>Job Title</th>
                <th>Department</th>
                <th>Openings</th>
                <th>Status</th>
                <th>Actions</th>
              </tr>
            </thead>

            <tbody>
              {filteredJobs.length === 0 ? (
                <tr>
                  <td colSpan="5" className="no-data">
                    No jobs found
                  </td>
                </tr>
              ) : (
                filteredJobs.map((job, rowIndex) => {
                  if (!job) return null;
                  const isActive =
                    String(job.status || "").toUpperCase() === "ACTIVE";
                  const rowKey =
                    job.id != null ? String(job.id) : `job-row-${rowIndex}`;

                  return (
                    <tr key={rowKey}>
                      <td>{job.job_title || "-"}</td>
                      <td>{job.department || "-"}</td>
                      <td>{job.openings || 1}</td>
                      <td>
                        <span
                          className={`status ${
                            isActive ? "status-active" : "status-inactive"
                          }`}
                        >
                          {job.status || "-"}
                        </span>
                      </td>
                      <td>
                        <TableIconActions>
                          <TableIconActionButton
                            variant="view"
                            tooltip="View job details"
                            onClick={() => setViewJob(job)}
                          />
                          <TableIconActionButton
                            variant="update"
                            tooltip="Edit job"
                            onClick={() =>
                              setUpdateJob({
                                ...job,
                                openings: job.openings || 1,
                              })
                            }
                          />
                          <TableIconActionButton
                            variant="delete"
                            tooltip="Delete job"
                            onClick={() => setDeleteJobId(job.id)}
                          />
                        </TableIconActions>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </section>

      <DetailDrawer
        open={!!viewJob}
        onClose={() => setViewJob(null)}
        title="Job Details"
        titleId="rec-job-view-title"
        size="lg"
      >
        {viewJob && (
          <div className="detail-drawer-card-grid">
            <DetailDrawerField label="Job title">
              {viewJob.job_title || "-"}
            </DetailDrawerField>
            <DetailDrawerField label="Department">
              {viewJob.department || "-"}
            </DetailDrawerField>
            <DetailDrawerField label="Location">
              {viewJob.location || "-"}
            </DetailDrawerField>
            <DetailDrawerField label="Experience">
              {viewJob.experience || "-"}
            </DetailDrawerField>
            <DetailDrawerField label="Openings">
              {viewJob.openings || 1}
            </DetailDrawerField>
            <DetailDrawerField label="Status">
              {viewJob.status || "-"}
            </DetailDrawerField>
            <DetailDrawerField label="Posted date">
              {formatDate(viewJob.posted_date)}
            </DetailDrawerField>
            <DetailDrawerField label="Description" full>
              {viewJob.description || "No description available"}
            </DetailDrawerField>
          </div>
        )}
      </DetailDrawer>

      <ModalPortal open={Boolean(updateJob)}>
        {updateJob ? (
        <div
          className="modal-overlay"
          onClick={() => setUpdateJob(null)}
          role="presentation"
        >
          <div className="modal-box" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h2>Update Job</h2>
              <button
                className="modal-close"
                onClick={() => setUpdateJob(null)}
                type="button"
              >
                &times;
              </button>
            </div>

            <form className="modal-form" onSubmit={handleUpdateSubmit}>
              <div className="form-row">
                <div className="form-group">
                  <label>Job Title</label>
                  <input
                    type="text"
                    value={updateJob.job_title || ""}
                    onChange={(e) =>
                      setUpdateJob({
                        ...updateJob,
                        job_title: e.target.value,
                      })
                    }
                    required
                  />
                </div>

                <div className="form-group">
                  <label>Department</label>
                  <input
                    type="text"
                    value={updateJob.department || ""}
                    onChange={(e) =>
                      setUpdateJob({
                        ...updateJob,
                        department: e.target.value,
                      })
                    }
                    required
                  />
                </div>
              </div>

              <div className="form-row">
                <div className="form-group">
                  <label>Location</label>
                  <input
                    type="text"
                    value={updateJob.location || ""}
                    onChange={(e) =>
                      setUpdateJob({
                        ...updateJob,
                        location: e.target.value,
                      })
                    }
                    required
                  />
                </div>

                <div className="form-group">
                  <label>Experience</label>
                  <input
                    type="text"
                    value={updateJob.experience || ""}
                    onChange={(e) =>
                      setUpdateJob({
                        ...updateJob,
                        experience: e.target.value,
                      })
                    }
                    required
                  />
                </div>
              </div>

              <div className="form-row">
                <div className="form-group">
                  <label>Status</label>
                  <select
                    value={updateJob.status || "ACTIVE"}
                    onChange={(e) =>
                      setUpdateJob({
                        ...updateJob,
                        status: e.target.value,
                      })
                    }
                    required
                  >
                    <option value="ACTIVE">ACTIVE</option>
                    <option value="INACTIVE">INACTIVE</option>
                  </select>
                </div>

                <div className="form-group">
                  <label>Openings</label>
                  <input
                    type="number"
                    min="1"
                    step="1"
                    value={updateJob.openings || ""}
                    onChange={(e) =>
                      setUpdateJob({
                        ...updateJob,
                        openings: e.target.value,
                      })
                    }
                    required
                  />
                </div>
              </div>

              <div className="form-row single">
                <div className="form-group">
                  <label>Description</label>
                  <textarea
                    rows="6"
                    value={updateJob.description || ""}
                    onChange={(e) =>
                      setUpdateJob({
                        ...updateJob,
                        description: e.target.value,
                      })
                    }
                    required
                  />
                </div>
              </div>

              <div className="modal-actions">
                <button
                  type="button"
                  className="secondary-btn"
                  onClick={() => setUpdateJob(null)}
                >
                  Cancel
                </button>
                <button type="submit" className="primary-btn">
                  Update Job
                </button>
              </div>
            </form>
          </div>
        </div>
        ) : null}
      </ModalPortal>

      <ModalPortal open={!!deleteJobId}>
        <div
          className="modal-overlay"
          onClick={() => setDeleteJobId(null)}
          role="presentation"
        >
          <div
            className="delete-modal-box"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="delete-icon">
              <i className="fa-solid fa-trash"></i>
            </div>

            <h2>Delete Job</h2>
            <p>
              Are you sure you want to delete this job? This action cannot be
              undone.
            </p>

            <div className="modal-actions center">
              <button
                type="button"
                className="secondary-btn"
                onClick={() => setDeleteJobId(null)}
              >
                Cancel
              </button>
              <button
                type="button"
                className="danger-btn"
                onClick={handleDelete}
              >
                Delete
              </button>
            </div>
          </div>
        </div>
      </ModalPortal>

      <AppPortalToast
        open={portalToast.show}
        message={portalToast.message}
        variant={portalToast.type === "error" ? "error" : "success"}
      />
    </Layout>
  );
}

export default ManageRecruiterJobs;