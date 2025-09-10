import * as S from "../style";

const Pagination = ({ currentPage, totalPages, onPageChange }) => {
  const getPageNumbers = () => {
    const pages = [];
    const maxVisiblePages = 5;

    let startPage = Math.max(1, currentPage - Math.floor(maxVisiblePages / 2));
    let endPage = Math.min(totalPages, startPage + maxVisiblePages - 1);

    if (endPage - startPage + 1 < maxVisiblePages) {
      startPage = Math.max(1, endPage - maxVisiblePages + 1);
    }

    for (let i = startPage; i <= endPage; i++) {
      pages.push(i);
    }

    return pages;
  };

  if (totalPages <= 1) return null;

  return (
    <S.PaginationContainer>
      <S.PaginationButton
        onClick={() => onPageChange(currentPage - 1)}
        disabled={currentPage === 1}
      >
        ‹
      </S.PaginationButton>

      {getPageNumbers().map((page) => (
        <S.PaginationButton
          key={page}
          $active={page === currentPage}
          onClick={() => onPageChange(page)}
        >
          {page}
        </S.PaginationButton>
      ))}

      <S.PaginationButton
        onClick={() => onPageChange(currentPage + 1)}
        disabled={currentPage === totalPages}
      >
        ›
      </S.PaginationButton>
    </S.PaginationContainer>
  );
};

export default Pagination;
