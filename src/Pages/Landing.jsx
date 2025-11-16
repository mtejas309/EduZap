import React, { useEffect, useState } from "react";
import {
  Table,
  TableHead,
  TableBody,
  TableRow,
  TableCell,
  TableContainer,
  Paper,
  Button,
  TextField,
  Typography,
  IconButton,
  Pagination,
  Box,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  Alert,
  CircularProgress,
  Backdrop,
  Card,
  CardContent,
  Grid,
  Chip,
  Avatar,
  LinearProgress,
  Fade,
  Slide,
  useTheme,
  useMediaQuery,
} from "@mui/material";
import {
  Delete as DeleteIcon,
  Sort as SortIcon,
  Add as AddIcon,
  Search as SearchIcon,
  Clear as ClearIcon,
  Image as ImageIcon,
  Schedule as ScheduleIcon,
  People as PeopleIcon,
  CopyAll as CopyAllIcon,
} from "@mui/icons-material";
import { createTheme, ThemeProvider } from "@mui/material/styles";
import { purple, blue } from "@mui/material/colors";

const theme = createTheme({
  palette: {
    primary: {
      main: purple[700],
      light: purple[50],
      dark: purple[900],
    },
    secondary: {
      main: blue[500],
      light: blue[100],
      dark: blue[700],
    },
    background: {
      default: "#f8f7ff",
      paper: "#ffffff",
    },
  },
  typography: {
    fontFamily: "'Inter', 'Roboto', 'Helvetica', 'Arial', sans-serif",
    h4: {
      fontWeight: 700,
    },
    h6: {
      fontWeight: 600,
    },
  },
  components: {
    MuiButton: {
      styleOverrides: {
        root: {
          borderRadius: 12,
          textTransform: "none",
          fontWeight: 600,
          padding: "8px 20px",
          transition: "all 0.3s ease",
          "&:hover": {
            transform: "translateY(-2px)",
            boxShadow: "0 6px 20px rgba(123, 31, 162, 0.3)",
          },
        },
      },
    },
    MuiPaper: {
      styleOverrides: {
        root: {
          borderRadius: 16,
          boxShadow: "0 4px 20px rgba(0, 0, 0, 0.08)",
          border: "1px solid rgba(123, 31, 162, 0.1)",
        },
      },
    },
    MuiTableCell: {
      styleOverrides: {
        head: {
          backgroundColor: purple[50],
          fontWeight: 700,
          color: purple[900],
          fontSize: "1rem",
        },
        root: {
          borderBottom: `1px solid ${purple[100]}`,
        },
      },
    },
  },
});

const API_URL = "http://localhost:4000/api";

function Landing() {
  const [open, setOpen] = useState(false);
  const [deleteModal, setDeleteModal] = useState(false);
  const [deleteId, setDeleteId] = useState("");

  const [formData, setFormData] = useState({
    name: "",
    phone: "",
    title: "",
    image: null,
  });

  const [errors, setErrors] = useState({});
  const [backendError, setBackendError] = useState("");

  const [requests, setRequests] = useState([]);
  const [search, setSearch] = useState("");
  const [sortOrder, setSortOrder] = useState("asc");

  const [pagination, setPagination] = useState({
    currentPage: 1,
    totalPages: 1,
    totalItems: 0,
    itemsPerPage: 5,
  });

  const [titleStats, setTitleStats] = useState({});

  const [loading, setLoading] = useState(false);
  const [submitLoading, setSubmitLoading] = useState(false);

  const muiTheme = useTheme();
  const isMobile = useMediaQuery(muiTheme.breakpoints.down("md"));

  const handleOpen = () => {
    setErrors({});
    setBackendError("");
    setOpen(true);
  };
  const handleClose = () => setOpen(false);

  const validateForm = () => {
    let temp = {};
    if (!formData.name.trim()) temp.name = "Name is required";
    if (!formData.phone.trim()) temp.phone = "Phone number is required";
    else if (!/^\d+$/.test(formData.phone))
      temp.phone = "Phone must contain digits only";
    else if (formData.phone.length !== 10)
      temp.phone = "Phone must be 10 digits";
    if (!formData.title.trim()) temp.title = "Title is required";
    setErrors(temp);
    return Object.keys(temp).length === 0;
  };

  const handleSubmit = async () => {
    if (!validateForm()) return;

    setBackendError("");
    setSubmitLoading(true);

    try {
      const fd = new FormData();
      fd.append("name", formData.name);
      fd.append("phone", formData.phone);
      fd.append("title", formData.title);

      if (formData.image) {
        fd.append("image", formData.image);
      }

      const res = await fetch(`${API_URL}/request`, {
        method: "POST",
        body: fd,
      });

      const json = await res.json();

      if (!res.ok) {
        setBackendError(json.error || "Something went wrong");
        setSubmitLoading(false);
        return;
      }

      fetchRequests();
      setFormData({ name: "", phone: "", title: "", image: null });
      handleClose();
    } catch (error) {
      setBackendError("Server Error");
    }

    setSubmitLoading(false);
  };

  const isRecent = (timestamp) => {
    const now = new Date();
    const time = new Date(timestamp);
    return (now - time) / (1000 * 60) <= 60;
  };

  const fetchRequests = async () => {
    setLoading(true);

    try {
      const params = new URLSearchParams({
        search,
        page: pagination.currentPage,
        limit: pagination.itemsPerPage,
        sortBy: "title",
        order: sortOrder,
      });

      const res = await fetch(`${API_URL}/requests?${params}`);
      const json = await res.json();

      setRequests(json.data);
      setPagination(json.pagination);

      const count = {};
      json.data.forEach((item) => {
        count[item.title] = (count[item.title] || 0) + 1;
      });

      const duplicates = {};
      Object.keys(count).forEach((title) => {
        if (count[title] > 1) duplicates[title] = count[title];
      });

      setTitleStats(duplicates);
    } catch (err) {
      console.log("Fetch error:", err);
    }

    setLoading(false);
  };

  useEffect(() => {
    fetchRequests();
  }, [search, pagination.currentPage, sortOrder]);

  const confirmDelete = (id) => {
    setDeleteId(id);
    setDeleteModal(true);
  };

  const deleteRequest = async () => {
    setLoading(true);
    await fetch(`${API_URL}/request/${deleteId}`, { method: "DELETE" });
    setDeleteModal(false);
    fetchRequests();
    setLoading(false);
  };

  const handlePageChange = (e, value) =>
    setPagination((p) => ({ ...p, currentPage: value }));

  return (
    <ThemeProvider theme={theme}>
      <Box
        sx={{
          padding: { xs: "15px", md: "30px" },
          minHeight: "100vh",
          background: "linear-gradient(135deg, #f8f7ff 0%, #f0f4ff 100%)",
        }}
      >
        {/* Global Loader */}
        <Backdrop
          open={loading}
          sx={{
            zIndex: 2000,
            background: "rgba(123, 31, 162, 0.1)",
            backdropFilter: "blur(5px)",
          }}
        >
          <Box textAlign="center">
            <CircularProgress
              size={60}
              thickness={4}
              sx={{
                color: purple[700],
                mb: 2,
              }}
            />
            <Typography variant="h6" color="primary.main">
              Loading...
            </Typography>
          </Box>
        </Backdrop>

        {/* Header Section */}
        <Slide in direction="down" timeout={500}>
          <Box sx={{ mb: 4 }}>
            <Typography
              variant="h3"
              component="h1"
              gutterBottom
              sx={{
                background: "linear-gradient(135deg, #7b1fa2 0%, #1976d2 100%)",
                backgroundClip: "text",
                WebkitBackgroundClip: "text",
                color: "transparent",
                fontWeight: 800,
                fontSize: { xs: "2rem", md: "3rem" },
              }}
            >
              Request Manager
            </Typography>
            <Typography variant="h6" color="text.secondary" sx={{ mb: 3 }}>
              Manage and track all your requests in one place
            </Typography>
          </Box>
        </Slide>

        {/* Stats Cards */}
        <Fade in timeout={800}>
          <Grid container spacing={3} sx={{ mb: 4 }}>
            <Grid item xs={12} md={3}>
              <Card
                sx={{
                  background:
                    "linear-gradient(135deg, #7b1fa2 0%, #9c27b0 100%)",
                  color: "white",
                  position: "relative",
                  overflow: "hidden",
                  "&:hover": {
                    transform: "translateY(-5px)",
                    transition: "transform 0.3s ease",
                  },
                }}
              >
                <CardContent>
                  <PeopleIcon sx={{ fontSize: 40, mb: 1, opacity: 0.8 }} />
                  <Typography variant="h6" gutterBottom>
                    Total Requests
                  </Typography>
                  <Typography variant="h3" fontWeight="bold">
                    {pagination.totalItems}
                  </Typography>
                </CardContent>
              </Card>
            </Grid>

            <Grid item xs={12} md={9}>
              <Card sx={{ height: "100%" }}>
                <CardContent>
                  <Box sx={{ display: "flex", alignItems: "center", mb: 2 }}>
                    <CopyAllIcon sx={{ color: purple[700], mr: 1 }} />
                    <Typography variant="h6" color="primary.main">
                      Duplicate Titles
                    </Typography>
                  </Box>
                  {Object.keys(titleStats).length > 0 ? (
                    <Grid container spacing={1}>
                      {Object.entries(titleStats).map(([title, count]) => (
                        <Grid item key={title}>
                          <Chip
                            label={`${title}: ${count}`}
                            variant="outlined"
                            color="primary"
                            sx={{
                              borderColor: purple[300],
                              background: purple[50],
                              fontWeight: 600,
                            }}
                          />
                        </Grid>
                      ))}
                    </Grid>
                  ) : (
                    <Typography color="text.secondary" fontStyle="italic">
                      No duplicate titles found
                    </Typography>
                  )}
                </CardContent>
              </Card>
            </Grid>
          </Grid>
        </Fade>

        {/* Action Bar */}
        <Fade in timeout={1000}>
          <Box
            sx={{
              mb: 3,
              display: "flex",
              flexWrap: "wrap",
              gap: 2,
              alignItems: "center",
            }}
          >
            <Button
              variant="contained"
              startIcon={<AddIcon />}
              onClick={handleOpen}
              sx={{
                background: "linear-gradient(135deg, #7b1fa2 0%, #1976d2 100%)",
                px: 3,
                py: 1,
              }}
            >
              Add Request
            </Button>

            <Box sx={{ flexGrow: 1, minWidth: 300 }}>
              <TextField
                fullWidth
                label="Search by Title"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                InputProps={{
                  startAdornment: (
                    <SearchIcon sx={{ color: purple[500], mr: 1 }} />
                  ),
                }}
                sx={{
                  "& .MuiOutlinedInput-root": {
                    borderRadius: 3,
                    "&:hover fieldset": {
                      borderColor: purple[300],
                    },
                  },
                }}
              />
            </Box>

            {search && (
              <Button
                variant="outlined"
                startIcon={<ClearIcon />}
                onClick={() => setSearch("")}
                sx={{ borderColor: purple[300], color: purple[700] }}
              >
                Clear
              </Button>
            )}
          </Box>
        </Fade>

        <Fade in timeout={1200}>
          <TableContainer
            component={Paper}
            sx={{
              borderRadius: 3,
              overflow: "hidden",
              background: "white",
            }}
          >
            {loading && (
              <LinearProgress
                sx={{
                  background: `linear-gradient(90deg, ${purple[500]}, ${blue[500]})`,
                }}
              />
            )}

            <Table>
              <TableHead>
                <TableRow>
                  <TableCell>
                    <Box sx={{ display: "flex", alignItems: "center" }}>
                      <PeopleIcon sx={{ mr: 1, color: purple[700] }} />
                      <b>Name</b>
                    </Box>
                  </TableCell>
                  <TableCell>
                    <b>Phone</b>
                  </TableCell>
                  <TableCell>
                    <Box sx={{ display: "flex", alignItems: "center" }}>
                      <CopyAllIcon sx={{ mr: 1, color: purple[700] }} />
                      <b>Title</b>
                      <IconButton
                        onClick={() =>
                          setSortOrder(sortOrder === "asc" ? "desc" : "asc")
                        }
                        size="small"
                        sx={{
                          ml: 1,
                          color: purple[700],
                          "&:hover": { background: purple[50] },
                        }}
                      >
                        <SortIcon />
                      </IconButton>
                    </Box>
                  </TableCell>
                  <TableCell>
                    <Box sx={{ display: "flex", alignItems: "center" }}>
                      <ImageIcon sx={{ mr: 1, color: purple[700] }} />
                      <b>Image</b>
                    </Box>
                  </TableCell>
                  <TableCell>
                    <Box sx={{ display: "flex", alignItems: "center" }}>
                      <ScheduleIcon sx={{ mr: 1, color: purple[700] }} />
                      <b>Timestamp</b>
                    </Box>
                  </TableCell>
                  <TableCell align="center">
                    <b>Action</b>
                  </TableCell>
                </TableRow>
              </TableHead>

              <TableBody>
                {requests.map((req) => (
                  <TableRow
                    key={req._id}
                    sx={{
                      background: isRecent(req.timestamp)
                        ? "linear-gradient(135deg, #fff7d6 0%, #fff0b3 100%)"
                        : "white",
                      transition: "all 0.2s ease",
                      "&:hover": {
                        background: isRecent(req.timestamp)
                          ? "linear-gradient(135deg, #fff0b3 0%, #ffe066 100%)"
                          : purple[50],
                        transform: "translateX(4px)",
                      },
                    }}
                  >
                    <TableCell>
                      <Typography fontWeight={600}>{req.name}</Typography>
                    </TableCell>
                    <TableCell>
                      <Chip
                        label={req.phone}
                        size="small"
                        variant="outlined"
                        sx={{ borderColor: blue[300], color: blue[700] }}
                      />
                    </TableCell>
                    <TableCell>
                      <Typography
                        sx={{
                          color: purple[800],
                          fontWeight: 500,
                        }}
                      >
                        {req.title}
                      </Typography>
                    </TableCell>
                    <TableCell>
                      {req.image ? (
                        <Avatar
                          src={`http://localhost:4000/api/request/image/${req._id}`}
                          sx={{
                            width: 50,
                            height: 50,
                            border: `2px solid ${purple[200]}`,
                          }}
                        />
                      ) : (
                        <Chip
                          icon={<ImageIcon />}
                          label="No Image"
                          variant="outlined"
                          size="small"
                          sx={{ borderColor: purple[200] }}
                        />
                      )}
                    </TableCell>
                    <TableCell>
                      <Box>
                        <Typography variant="body2" fontWeight={500}>
                          {new Date(req.timestamp).toLocaleDateString()}
                        </Typography>
                        <Typography variant="caption" color="text.secondary">
                          {new Date(req.timestamp).toLocaleTimeString()}
                        </Typography>
                        {isRecent(req.timestamp) && (
                          <Chip
                            label="New"
                            size="small"
                            color="secondary"
                            sx={{
                              ml: 1,
                              height: 20,
                              fontSize: "0.7rem",
                            }}
                          />
                        )}
                      </Box>
                    </TableCell>
                    <TableCell align="center">
                      <IconButton
                        color="error"
                        onClick={() => confirmDelete(req._id)}
                        sx={{
                          background: "rgba(211, 47, 47, 0.1)",
                          "&:hover": {
                            background: "rgba(211, 47, 47, 0.2)",
                            transform: "scale(1.1)",
                          },
                        }}
                      >
                        <DeleteIcon />
                      </IconButton>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>

            {requests.length === 0 && !loading && (
              <Box sx={{ textAlign: "center", py: 8 }}>
                <PeopleIcon sx={{ fontSize: 60, color: purple[300], mb: 2 }} />
                <Typography variant="h6" color="text.secondary">
                  No requests found
                </Typography>
                <Typography
                  variant="body2"
                  color="text.secondary"
                  sx={{ mt: 1 }}
                >
                  {search
                    ? "Try adjusting your search terms"
                    : "Get started by adding your first request"}
                </Typography>
              </Box>
            )}
          </TableContainer>
        </Fade>

        {pagination.totalPages > 1 && (
          <Fade in timeout={1500}>
            <Box
              sx={{ marginTop: 3, display: "flex", justifyContent: "center" }}
            >
              <Pagination
                count={pagination.totalPages}
                page={pagination.currentPage}
                onChange={handlePageChange}
                color="primary"
                size={isMobile ? "small" : "medium"}
                sx={{
                  "& .MuiPaginationItem-root": {
                    borderRadius: 2,
                    fontWeight: 600,
                  },
                  "& .Mui-selected": {
                    background: `linear-gradient(135deg, ${purple[600]}, ${blue[600]})`,
                    color: "white",
                    "&:hover": {
                      background: `linear-gradient(135deg, ${purple[700]}, ${blue[700]})`,
                    },
                  },
                }}
              />
            </Box>
          </Fade>
        )}

        <Dialog
          open={open}
          onClose={handleClose}
          PaperProps={{
            sx: {
              borderRadius: 3,
              background: "linear-gradient(135deg, #fefbff 0%, #f8f7ff 100%)",
            },
          }}
          maxWidth="sm"
          fullWidth
        >
          <DialogTitle
            sx={{
              background: "linear-gradient(135deg, #7b1fa2 0%, #1976d2 100%)",
              color: "white",
            }}
          >
            <Typography variant="h5" fontWeight={600}>
              Add New Request
            </Typography>
          </DialogTitle>

          <DialogContent sx={{ p: 3 }}>
            {backendError && (
              <Alert
                severity="error"
                sx={{
                  mb: 2,
                  borderRadius: 2,
                }}
              >
                {backendError}
              </Alert>
            )}

            <TextField
              margin="dense"
              label="Name"
              fullWidth
              error={!!errors.name}
              helperText={errors.name}
              value={formData.name}
              onChange={(e) =>
                setFormData({ ...formData, name: e.target.value })
              }
              sx={{ mb: 2 }}
            />

            <TextField
              margin="dense"
              label="Phone"
              fullWidth
              error={
                !!errors.phone || backendError === "Phone number already exists"
              }
              helperText={
                errors.phone ||
                (backendError === "Phone number already exists"
                  ? backendError
                  : "")
              }
              value={formData.phone}
              onChange={(e) =>
                setFormData({ ...formData, phone: e.target.value })
              }
              sx={{ mb: 2 }}
            />

            <TextField
              margin="dense"
              label="Title"
              fullWidth
              error={!!errors.title}
              helperText={errors.title}
              value={formData.title}
              onChange={(e) =>
                setFormData({ ...formData, title: e.target.value })
              }
              sx={{ mb: 3 }}
            />

            <Box sx={{ textAlign: "center" }}>
              <input
                type="file"
                accept="image/*"
                id="image-upload"
                style={{ display: "none" }}
                onChange={(e) =>
                  setFormData({ ...formData, image: e.target.files[0] })
                }
              />
              <label htmlFor="image-upload">
                <Button
                  variant="outlined"
                  component="span"
                  startIcon={<ImageIcon />}
                  sx={{
                    borderColor: purple[300],
                    color: purple[700],
                    "&:hover": {
                      borderColor: purple[500],
                      background: purple[50],
                    },
                  }}
                >
                  {formData.image ? "Change Image" : "Upload Image"}
                </Button>
              </label>
              {formData.image && (
                <Typography
                  variant="caption"
                  display="block"
                  sx={{ mt: 1, color: purple[600] }}
                >
                  Selected: {formData.image.name}
                </Typography>
              )}
            </Box>
          </DialogContent>

          <DialogActions sx={{ p: 3, gap: 1 }}>
            <Button
              onClick={handleClose}
              sx={{
                color: purple[700],
                "&:hover": {
                  background: purple[50],
                },
              }}
            >
              Cancel
            </Button>

            <Button
              variant="contained"
              onClick={handleSubmit}
              disabled={submitLoading}
              sx={{
                background: "linear-gradient(135deg, #7b1fa2 0%, #1976d2 100%)",
                px: 4,
                "&:disabled": {
                  background: purple[200],
                },
              }}
            >
              {submitLoading ? (
                <CircularProgress size={24} sx={{ color: "white" }} />
              ) : (
                "Submit Request"
              )}
            </Button>
          </DialogActions>
        </Dialog>

        <Dialog
          open={deleteModal}
          onClose={() => setDeleteModal(false)}
          PaperProps={{
            sx: {
              borderRadius: 3,
            },
          }}
        >
          <DialogTitle sx={{ color: "error.main", fontWeight: 600 }}>
            Confirm Delete
          </DialogTitle>

          <DialogContent>
            <Alert severity="warning" sx={{ borderRadius: 2, mb: 2 }}>
              This action cannot be undone. Are you sure you want to delete this
              request?
            </Alert>
          </DialogContent>

          <DialogActions sx={{ p: 3, gap: 1 }}>
            <Button
              onClick={() => setDeleteModal(false)}
              sx={{
                color: purple[700],
                "&:hover": {
                  background: purple[50],
                },
              }}
            >
              Cancel
            </Button>

            <Button
              color="error"
              variant="contained"
              onClick={deleteRequest}
              sx={{
                background: "linear-gradient(135deg, #d32f2f 0%, #f44336 100%)",
                "&:hover": {
                  background:
                    "linear-gradient(135deg, #b71c1c 0%, #d32f2f 100%)",
                },
              }}
            >
              Delete
            </Button>
          </DialogActions>
        </Dialog>
      </Box>
    </ThemeProvider>
  );
}

export default Landing;
