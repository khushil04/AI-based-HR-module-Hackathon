interface PaginationProps {
  page: number;
  totalPages: number;
  total?: number;
  onPageChange: (page: number) => void;
}

const Pagination = ({ page, totalPages, total, onPageChange }: PaginationProps) => (
  <div className="pagination">
    <span className="pagination-info">
      Page {page} of {totalPages}
      {total !== undefined && ` · ${total} total`}
    </span>
    <div className="pagination-btns">
      <button
        type="button"
        className="btn btn-secondary btn-sm"
        disabled={page <= 1}
        onClick={() => onPageChange(page - 1)}
      >
        ← Previous
      </button>
      <button
        type="button"
        className="btn btn-secondary btn-sm"
        disabled={page >= totalPages}
        onClick={() => onPageChange(page + 1)}
      >
        Next →
      </button>
    </div>
  </div>
);

export default Pagination;
