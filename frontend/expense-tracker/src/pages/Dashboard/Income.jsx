import React, { useEffect, useState } from 'react'
import DashboardLayout from '../../components/layouts/DashboardLayout'
import axiosInstance from '../../utils/axiosInstance';
import { API_PATHS } from '../../utils/apiPaths';
import IncomeOverview from '../../components/Income/IncomeOverview';
import Modal from '../../components/Modal';
import AddIncomeForm from '../../components/Income/AddIncomeForm';
import toast from 'react-hot-toast';
import IncomeList from '../../components/Income/IncomeList';
import DeleteAlert from '../../components/DeleteAlert';
import { useUserAuth } from '../../hooks/useUserAuth';

const PAGE_SIZE = 10;

const Income = () => {
  useUserAuth();
  const [incomeData, setIncomeData] = useState([]);
  const [loading, setLoading] = useState(false);
  const [page, setPage] = useState(1);
  const [hasMore, setHasMore] = useState(true);
  const [openDeleteAlert, setOpenDeleteAlert] = useState({
    show: false,
    data: null,
  });
  const [OpenAddIncomeModal, setOpenAddIncomeModal] = useState(false);

  // Fetch incomes with pagination
  const fetchIncomeDetails = async (pageNum = 1, append = false) => {
    if (loading) return;
    setLoading(true);

    try {
      const response = await axiosInstance.get(
        `${API_PATHS.INCOME.GET_ALL_INCOME}?page=${pageNum}&limit=${PAGE_SIZE}`
      );

      if (response.data) {
        const newIncomes = response.data.incomes || [];
        setIncomeData(prev => append ? [...prev, ...newIncomes] : newIncomes);

        // Check if there are more pages
        const pagination = response.data.pagination;
        if (pagination) {
          setHasMore(pageNum < pagination.pages);
        } else {
          setHasMore(false);
        }
      }
    } catch (error) {
      console.error("Something went wrong. Please try Again Later", error);
    } finally {
      setLoading(false);
    }
  };

  // Load more handler
  const handleLoadMore = () => {
    const nextPage = page + 1;
    setPage(nextPage);
    fetchIncomeDetails(nextPage, true);
  };

  // Handle Add Income
  const handleAddIncome = async (income) => {
    const { source, amount, date, icon } = income;

    if (!source.trim()) {
      toast.error("Source is required");
      return;
    }
    if (!amount || isNaN(amount) || Number(amount) <= 0) {
      toast.error("Amount should be a valid number greater than 0");
      return;
    }
    if (!date) {
      toast.error("Date is required");
      return;
    }

    try {
      await axiosInstance.post(`${API_PATHS.INCOME.ADD_INCOME}`, {
        source, amount, date, icon
      });

      setOpenAddIncomeModal(false);
      toast.success("Income added successfully");
      // Reset to page 1 and refresh
      setPage(1);
      fetchIncomeDetails(1, false);
    }
    catch (error) {
      console.error("Error adding income:", error.response?.data?.message || error.message);
    }
  };

  // Handle Delete Income
  const DeleteIncome = async (id) => {
    try {
      await axiosInstance.delete(`${API_PATHS.INCOME.DELETE_INCOME(id)}`);
      setOpenDeleteAlert({ show: false, data: null });
      toast.success("Income deleted successfully");
      // Remove from local state instantly
      setIncomeData(prev => prev.filter(i => i._id !== id));
    } catch (error) {
      console.error("Error deleting income:", error.response?.data?.message || error.message);
      toast.error("Failed to delete income");
    }
  }

  // Handle download income details
  const handleDownloadIncomeDetails = async () => {
    if (!incomeData || incomeData.length === 0) {
      toast.error("No income data to download. Please add some income first!", { id: "no-income-download" });
      return;
    }
    try {
      const response = await axiosInstance.get(
        API_PATHS.INCOME.DOWNLOAD_INCOME,
        { responseType: 'blob' }
      );

      const url = window.URL.createObjectURL(new Blob([response.data]))
      const link = document.createElement("a");
      link.href = url;
      link.setAttribute("download", "income_details.xlsx");
      document.body.appendChild(link);
      link.click();
      link.parentNode.removeChild(link);
      window.URL.revokeObjectURL(url);
    } catch (error) {
      console.error("Error downloading income details:", error);
      toast.error("Failed to download income details, please try again later");
    }
  };

  useEffect(() => {
    fetchIncomeDetails(1, false);
    return () => { };
  }, []);

  return (
    <DashboardLayout activeMenu="Income">
      <div className='my-5 mx-auto'>
        <div className="grid grid-cols-1 gap-6">
          <div className="">
            <IncomeOverview
              transactions={incomeData}
              onAddIncome={() => setOpenAddIncomeModal(true)}
            />
          </div>

          <IncomeList
            transactions={incomeData}
            oneDelete={(id) => {
              setOpenDeleteAlert({ show: true, data: id });
            }}
            onDownload={handleDownloadIncomeDetails}
          />

          {/* Load More Button */}
          {hasMore && (
            <div className="flex justify-center">
              <button
                onClick={handleLoadMore}
                disabled={loading}
                className="px-6 py-2.5 text-sm font-medium text-white bg-primary rounded-lg hover:bg-primary/90 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
              >
                {loading ? "Loading..." : "Load More"}
              </button>
            </div>
          )}
        </div>

        <Modal
          isOpen={OpenAddIncomeModal}
          onClose={() => setOpenAddIncomeModal(false)}
          title="Add Income"
        >
          <AddIncomeForm onAddIncome={handleAddIncome} />
        </Modal>

        <Modal
          isOpen={openDeleteAlert.show}
          onClose={() => setOpenDeleteAlert({ show: false, data: null })}
          title="Delete Income"
        >
          <DeleteAlert
            content="Are you sure you want to delete this income?"
            onDelete={() => DeleteIncome(openDeleteAlert.data)}
          />
        </Modal>
      </div>
    </DashboardLayout>
  )
}

export default Income