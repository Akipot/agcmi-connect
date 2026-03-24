import { ChevronsLeft, ChevronLeft, ChevronRight, ChevronsRight } from 'lucide-react';

interface PaginationProps {
  currentPage: number;
  totalPages: number;
  rowsPerPage: number;
  setCurrentPage: (page: number) => void;
  setRowsPerPage: (rows: number) => void;
}

export default function Pagination({
  currentPage,
  totalPages,
  rowsPerPage,
  setCurrentPage,
  setRowsPerPage,
}: PaginationProps) {
  return (
    <div className="flex flex-col sm:flex-row items-center sm:justify-end space-y-2 sm:space-y-0 sm:space-x-2 mt-4 text-sm text-gray-700 dark:text-gray-300">

      {/* Rows per page */}
      <div className="flex items-center space-x-1">
        <span className="hidden sm:inline">Show</span>
        <select
          value={rowsPerPage}
          onChange={(e) => {
            setRowsPerPage(Number(e.target.value));
            setCurrentPage(1);
          }}
          className="border rounded px-2 py-1 cursor-pointer border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 text-gray-700 dark:text-gray-300 text-xs sm:text-sm"
        >
          {[5, 10, 25, 50].map((num) => (
            <option key={num} value={num}>
              {num}
            </option>
          ))}
        </select>
        <span className="hidden sm:inline">Rows</span>
      </div>

      {/* Page info */}
      <span className="text-xs sm:text-sm">
        Page <strong>{currentPage}</strong> of <strong>{totalPages}</strong>
      </span>

      {/* Pagination buttons */}
      <div className="flex items-center space-x-1">
        <button
          onClick={() => setCurrentPage(1)}
          disabled={currentPage === 1}
          className="p-1 rounded border border-gray-300 dark:border-gray-600 disabled:opacity-50 cursor-pointer dark:text-gray-300 text-gray-700"
          aria-label="First Page"
        >
          <ChevronsLeft size={18} />
        </button>

        <button
          onClick={() => setCurrentPage(currentPage - 1)}
          disabled={currentPage === 1}
          className="p-1 rounded border border-gray-300 dark:border-gray-600 disabled:opacity-50 cursor-pointer dark:text-gray-300 text-gray-700"
          aria-label="Previous Page"
        >
          <ChevronLeft size={18} />
        </button>

        <button
          onClick={() => setCurrentPage(currentPage + 1)}
          disabled={currentPage === totalPages}
          className="p-1 rounded border border-gray-300 dark:border-gray-600 disabled:opacity-50 cursor-pointer dark:text-gray-300 text-gray-700"
          aria-label="Next Page"
        >
          <ChevronRight size={18} />
        </button>

        <button
          onClick={() => setCurrentPage(totalPages)}
          disabled={currentPage === totalPages}
          className="p-1 rounded border border-gray-300 dark:border-gray-600 disabled:opacity-50 cursor-pointer dark:text-gray-300 text-gray-700"
          aria-label="Last Page"
        >
          <ChevronsRight size={18} />
        </button>
      </div>
    </div>
  );
}
