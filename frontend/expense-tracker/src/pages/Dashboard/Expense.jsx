import React, { useEffect, useState } from 'react'
import { useUserAuth } from '../../hooks/useUserAuth'
import DashboardLayout from '../../components/layouts/DashboardLayout';
import { API_PATHS } from '../../utils/apiPaths';
import toast from 'react-hot-toast';
import axiosInstance from '../../utils/axiosInstance';
import ExpenseOverview from '../../components/Expense/ExpenseOverview';
import Modal from '../../components/Modal';
import AddExpenseForm from '../../components/Expense/AddExpenseForm';
import ExpenseList from '../../components/Expense/ExpenseList';
import DeleteAlert from '../../components/DeleteAlert';

const PAGE_SIZE = 10;

const Expense = () => {
  useUserAuth();
  const [expenseData, setExpenseData] = useState([]);
  const [loading, setLoading] = useState(false);
  const [page, setPage] = useState(1);
  const [hasMore, setHasMore] = useState(true);
  const [openDeleteAlert, setOpenDeleteAlert] = useState({
    show: false,
    data: null,
  });
  const [OpenAddExpenseModal, setOpenAddExpenseModal] = useState(false);

  // Fetch expenses with pagination
  const fetchExpenseDetails = async (pageNum = 1, append = false) => {
    if (loading) return;
    setLoading(true);

    try {
      const response = await axiosInstance.get(
        `${API_PATHS.EXPENSE.GET_ALL_EXPENSE}?page=${pageNum}&limit=${PAGE_SIZE}`
      );

      if (response.data) {
        const newExpenses = response.data.expenses || [];
        setExpenseData(prev => append ? [...prev, ...newExpenses] : newExpenses);

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
    fetchExpenseDetails(nextPage, true);
  };

  // Handle Add Expense
  const handleAddExpense = async (expense) => {
    const { category, amount, date, icon } = expense;

    if (!category.trim()) {
      toast.error("Category is required");
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
      await axiosInstance.post(`${API_PATHS.EXPENSE.ADD_EXPENSE}`, {
        category, amount, date, icon
      });

      setOpenAddExpenseModal(false);
      toast.success("Expense added successfully");
      // Reset to page 1 and refresh
      setPage(1);
      fetchExpenseDetails(1, false);
    }
    catch (error) {
      console.error("Error adding expense:", error.response?.data?.message || error.message);
    }
  };

  // Handle Delete Expense
  const DeleteExpense = async (id) => {
    try {
      await axiosInstance.delete(`${API_PATHS.EXPENSE.DELETE_EXPENSE(id)}`);

      setOpenDeleteAlert({ show: false, data: null });
      toast.success("Expense deleted successfully");
      // Remove from local state instantly (no refetch needed)
      setExpenseData(prev => prev.filter(e => e._id !== id));
    } catch (error) {
      console.error("Error deleting expense:", error.response?.data?.message || error.message);
      toast.error("Failed to delete expense");
    }
  }

  // Handle download expense details
  const handleDownloadExpenseDetails = async () => {
    if (!expenseData || expenseData.length === 0) {
      toast.error("No expense data to download. Please add some expenses first!", { id: "no-expense-download" });
      return;
    }
    try {
      const response = await axiosInstance.get(
        API_PATHS.EXPENSE.DOWNLOAD_EXPENSE,
        { responseType: 'blob' }
      );

      const url = window.URL.createObjectURL(new Blob([response.data]))
      const link = document.createElement("a");
      link.href = url;
      link.setAttribute("download", "expense_details.xlsx");
      document.body.appendChild(link);
      link.click();
      link.parentNode.removeChild(link);
      window.URL.revokeObjectURL(url);
    } catch (error) {
      console.error("Error downloading expense details:", error);
      toast.error("Failed to download expense details, please try again later");
    }
  }

  useEffect(() => {
    fetchExpenseDetails(1, false);
    return () => { };
  }, []);

  return (
    <DashboardLayout activeMenu="Expense">
      <div className='my-5 mx-auto'>
        <div className="grid grid-cols-1 gap-6">
          <div className="">
            <ExpenseOverview
              transactions={expenseData}
              onExpenseIncome={() => setOpenAddExpenseModal(true)}
            />
          </div>

          <ExpenseList
            transactions={expenseData}
            onDelete={(id) => {
              setOpenDeleteAlert({ show: true, data: id });
            }}
            onDownload={handleDownloadExpenseDetails}
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
          isOpen={OpenAddExpenseModal}
          onClose={() => setOpenAddExpenseModal(false)}
          title="Add Expense"
        >
          <AddExpenseForm onAddExpense={handleAddExpense} />
        </Modal>

        <Modal
          isOpen={openDeleteAlert.show}
          onClose={() => setOpenDeleteAlert({ show: false, data: null })}
          title="Delete Expense"
        >
          <DeleteAlert
            content="Are you sure you want to delete this expense?"
            onDelete={() => DeleteExpense(openDeleteAlert.data)}
          />
        </Modal>
      </div>
    </DashboardLayout>
  )
}

export default Expense