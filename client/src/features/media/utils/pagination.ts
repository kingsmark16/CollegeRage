const MAX_VISIBLE_PAGES = 5;

export const getVisiblePageNumbers = (currentPage: number, totalPages: number) => {
  if (totalPages <= MAX_VISIBLE_PAGES) {
    return Array.from({ length: totalPages }, (_, index) => index + 1);
  }

  const pages = new Set<number>([1, totalPages, currentPage]);

  if (currentPage <= 3) {
    pages.add(2);
    pages.add(3);
    pages.add(4);
  } else if (currentPage >= totalPages - 2) {
    pages.add(totalPages - 1);
    pages.add(totalPages - 2);
    pages.add(totalPages - 3);
  } else {
    pages.add(currentPage - 1);
    pages.add(currentPage + 1);
  }

  return Array.from(pages)
    .filter((page) => page >= 1 && page <= totalPages)
    .sort((left, right) => left - right);
};

export const getPaginationItems = (currentPage: number, totalPages: number) => {
  const visiblePages = getVisiblePageNumbers(currentPage, totalPages);

  return visiblePages.reduce<Array<number | 'ellipsis'>>((items, pageNumber, index) => {
    const previousPage = visiblePages[index - 1];

    if (typeof previousPage === 'number' && pageNumber - previousPage > 1) {
      items.push('ellipsis');
    }

    items.push(pageNumber);
    return items;
  }, []);
};
