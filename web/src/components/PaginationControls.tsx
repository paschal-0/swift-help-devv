"use client";

type PaginationControlsProps = {
  page: number;
  pageSize: number;
  totalItems: number;
  onPageChange: (page: number) => void;
  className?: string;
};

export function PaginationControls({
  page,
  pageSize,
  totalItems,
  onPageChange,
  className = "",
}: PaginationControlsProps) {
  const totalPages = Math.max(1, Math.ceil(totalItems / pageSize));
  const safePage = Math.min(Math.max(page, 1), totalPages);
  const start = totalItems === 0 ? 0 : (safePage - 1) * pageSize + 1;
  const end = Math.min(totalItems, safePage * pageSize);
  const windowStart = Math.max(1, Math.min(safePage - 2, totalPages - 4));
  const windowEnd = Math.min(totalPages, windowStart + 4);
  const pages = Array.from({ length: windowEnd - windowStart + 1 }, (_, index) => windowStart + index);

  return (
    <div className={`flex flex-col gap-3 pt-4 sm:flex-row sm:items-center sm:justify-between ${className}`}>
      <p className="text-[12px] font-normal tracking-[-0.03em] text-[#94A3B8]">
        Showing {start}-{end} of {totalItems}
      </p>
      <div className="flex flex-wrap items-center gap-2">
        <button
          type="button"
          onClick={() => onPageChange(safePage - 1)}
          disabled={safePage === 1}
          className="inline-flex h-8 min-w-8 cursor-pointer items-center justify-center rounded-[8px] border border-[#CBD5E1] bg-[#F8FAFC] px-2 text-[12px] font-medium text-[#1565C0] transition hover:-translate-y-0.5 hover:bg-[#E3F2FD] disabled:cursor-not-allowed disabled:opacity-45 disabled:hover:translate-y-0"
          aria-label="Previous page"
        >
          Prev
        </button>
        {pages.map((item) => (
          <button
            key={item}
            type="button"
            onClick={() => onPageChange(item)}
            className={`inline-flex h-8 min-w-8 cursor-pointer items-center justify-center rounded-[8px] border px-2 text-[12px] font-semibold transition hover:-translate-y-0.5 ${
              item === safePage
                ? "border-[#1565C0] bg-[#1565C0] text-[#F8FAFC]"
                : "border-[#CBD5E1] bg-[#F8FAFC] text-[#1565C0] hover:bg-[#E3F2FD]"
            }`}
            aria-current={item === safePage ? "page" : undefined}
          >
            {item}
          </button>
        ))}
        <button
          type="button"
          onClick={() => onPageChange(safePage + 1)}
          disabled={safePage === totalPages}
          className="inline-flex h-8 min-w-8 cursor-pointer items-center justify-center rounded-[8px] border border-[#CBD5E1] bg-[#F8FAFC] px-2 text-[12px] font-medium text-[#1565C0] transition hover:-translate-y-0.5 hover:bg-[#E3F2FD] disabled:cursor-not-allowed disabled:opacity-45 disabled:hover:translate-y-0"
          aria-label="Next page"
        >
          Next
        </button>
      </div>
    </div>
  );
}
