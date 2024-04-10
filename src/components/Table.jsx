import React, { useMemo, useState, useEffect } from "react";
import {
  createColumnHelper,
  flexRender,
  getCoreRowModel,
  getFilteredRowModel,
  getPaginationRowModel,
  useReactTable,
} from "@tanstack/react-table";
import DownloadBtn from "./DownloadBtn";
import DebouncedInput from "./DebouncedInput";
import { FaSortUp, FaSortDown } from 'react-icons/fa';
import { AiOutlineSearch } from 'react-icons/ai';
import sortData from "./Sorting";

const Table = () => {
  const columnHelper = createColumnHelper();

  const columns = useMemo(
    () => [
      columnHelper.accessor("id", {
        header: "ID",
        Cell: ({ value }) => <span>{value}</span>,
      }),
      columnHelper.accessor("name", {
        header: "Name",
        Cell: ({ value }) => <span>{value}</span>,
      }),
      columnHelper.accessor("rank", {
        header: "Rank",
        Cell: ({ value }) => <span>{value}</span>,
      }),
      columnHelper.accessor("price_usd", {
        header: "Price (USD)",
        Cell: ({ value }) => <span>{value}</span>,
      }),
      columnHelper.accessor("percent_change_24h", {
        header: "Percent Change (24h)",
        Cell: ({ value }) => <span>{value}</span>,
      }),
      columnHelper.accessor("price_btc", {
        header: "Price (BTC)",
        Cell: ({ value }) => <span>{value}</span>,
      }),
      columnHelper.accessor("market_cap_usd", {
        header: "Market Cap (USD)",
        Cell: ({ value }) => <span>{value}</span>,
      }),
    ],
    [columnHelper]
  );

  const [data, setData] = useState([]);
  const [globalFilter, setGlobalFilter] = useState("");
  const [loading, setLoading] = useState(true);
  const [sort, setSort] = useState({ keyToSort: "", direction: "asc" });

  useEffect(() => {
    const fetchData = async () => {
      try {
        const response = await fetch("https://api.coinlore.net/api/tickers/");
        if (!response.ok) {
          throw new Error("Failed to fetch data");
        }
        const jsonData = await response.json();
        setData(jsonData.data || []);
        setLoading(false);
      } catch (error) {
        console.error("Error fetching data:", error);
      }
    };

    fetchData();
  }, []);

  const table = useReactTable({
    data, columns,
    state: {
      globalFilter,
    },
    getFilteredRowModel: getFilteredRowModel(),
    getCoreRowModel: getCoreRowModel(),
    getPaginationRowModel: getPaginationRowModel(),
  });

  const handleGlobalFilterChange = (value) => {
    setGlobalFilter(String(value));
  };

  const handleHeaderClick = (header) => {
    sortData(header, data, sort, setSort, setData);
  };

  return (
    <div className="flex justify-center items-center h-screen">
      <div className="p-2 max-w-5xl mx-auto text-black fill-gray-400">
        <div className="flex justify-center">
          <table className="border border-gray-700 text-left rounded-lg overflow-hidden">
            <thead className="bg-white">
              <tr>
                <th colSpan={7} className="px-3.5 py-12">
                  <div className="flex justify-between items-center">
                    <div className="flex items-center gap-1">
                      <div className="relative">
                        <AiOutlineSearch className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
                        <DebouncedInput
                          value={globalFilter ?? ""}
                          onChange={handleGlobalFilterChange}
                          className="pl-12 pr-4 py-2 bg-transparent rounded-full bg-white border border-gray-300 focus:outline-none focus:border-black
                          "
                          placeholder="Search all columns..."
                        />
                      </div>
                    </div>
                    <DownloadBtn data={data} fileName={"crypto_data"} />
                  </div>
                </th>
              </tr>
              {table.getHeaderGroups().map((headerGroup) => (
                <tr key={headerGroup.id}>
                  {headerGroup.headers.map((header) => (
                    <th
                      key={header.id}
                      onClick={() => handleHeaderClick(header)}
                      className="capitalize px-3.5 py-2 cursor-pointer"
                      style={{ whiteSpace: 'nowrap' }}
                    >
                      <div style={{ display: 'flex', alignItems: 'center' }}>
                        <div>{header.column.columnDef.header}</div>
                        {sort.keyToSort === header.id && (
                          <div>{sort.direction === "asc" ? <FaSortUp /> : <FaSortDown />}</div>
                        )}
                      </div>
                    </th>
                  ))}
                </tr>
              ))}
            </thead>
            <tbody>
              {table.getRowModel().rows.length ? (
                table.getRowModel().rows.map((row, i) => (
                  <tr
                    key={row.id}
                    className={`${i % 2 === 0 ? "bg-white" : "bg-white"}`}
                  >
                    {row.getVisibleCells().map((cell) => (
                      <td key={cell.id} className="px-3.5 py-2">
                        {flexRender(
                          cell.column.columnDef.cell,
                          cell.getContext()
                        )}
                      </td>
                    ))}
                  </tr>
                ))
              ) : (
                <tr className="text-center h-32">
                  <td colSpan={7}>No Record Found!</td>
                </tr>
              )}
            </tbody>
            <tfoot>
              <tr>
                <td colSpan={7} className="px-3.5 py-4 bg-white">
                  <div className="flex items-center justify-end gap-2">
                    <button
                      onClick={() => {
                        table.previousPage();
                      }}
                      disabled={!table.getCanPreviousPage()}
                      className="p-1 border border-gray-300 px-2 disabled:opacity-30"
                    >
                      {"<"}
                    </button>
                    <button
                      onClick={() => {
                        table.nextPage();
                      }}
                      disabled={!table.getCanNextPage()}
                      className="p-1 border border-gray-300 px-2 disabled:opacity-30"
                    >
                      {">"}
                    </button>
                    <span className="flex items-center gap-1">
                      <div>Page</div>
                      <strong>
                        {table.getState().pagination.pageIndex + 1} of{" "}
                        {table.getPageCount()}
                      </strong>
                    </span>
                    <span className="flex items-center gap-1">
                      | Go to page:
                      <input
                        type="number"
                        defaultValue={
                          table.getState().pagination.pageIndex + 1
                        }
                        onChange={(e) => {
                          const page = e.target.value
                            ? Number(e.target.value) - 1
                            : 0;
                          table.setPageIndex(page);
                        }}
                        className="border p-1 rounded w-16 bg-transparent"
                      />
                    </span>
                    <select
                      value={table.getState().pagination.pageSize}
                      onChange={(e) => {
                        table.setPageSize(Number(e.target.value));
                      }}
                      className="p-2 bg-transparent"
                    >
                      {[10, 20, 30, 50].map((pageSize) => (
                        <option key={pageSize} value={pageSize}>
                          Show {pageSize}
                        </option>
                      ))}
                    </select>
                  </div>
                </td>
              </tr>
            </tfoot>
          </table>
        </div>
      </div>
    </div>
  );
};

export default Table;
