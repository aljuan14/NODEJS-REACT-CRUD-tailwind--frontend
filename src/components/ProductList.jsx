import React, { useMemo, useCallback } from 'react';
import { Link } from 'react-router-dom';
import axios from 'axios';
import useSWR, { useSWRConfig } from 'swr';
import { useTable, useSortBy, useGlobalFilter, usePagination } from 'react-table';

// Global filter for search functionality
const GlobalFilter = ({ globalFilter, setGlobalFilter }) => (
    <span>
        Search:{' '}
        <input
            value={globalFilter || ''}
            onChange={e => setGlobalFilter(e.target.value || undefined)}
            placeholder="Search product name"
            className="border rounded py-1 px-2"
        />
    </span>
);

const ProductList = () => {
    const { mutate } = useSWRConfig();
    const fetcher = async () => {
        const response = await axios.get('http://localhost:5000/products');
        return response.data;
    };
    const { data, error } = useSWR('products', fetcher);

    const products = useMemo(() => data || [], [data]);

    const deleteProduct = useCallback(async (productId) => {
        const confirmDelete = window.confirm("Apakah Anda yakin ingin menghapus produk ini?");
        if (confirmDelete) {
            await axios.delete(`http://localhost:5000/products/${productId}`);
            mutate('products');
        }
    }, [mutate]);

    const columns = useMemo(
        () => [
            {
                Header: '#',
                accessor: (row, i) => i + 1, // Index
            },
            {
                Header: 'Product Name',
                accessor: 'name',
            },
            {
                Header: 'Quantity',
                accessor: 'quantity',
            },
            {
                Header: 'Price',
                accessor: 'price',
            },
            {
                Header: 'Action Buttons',
                Cell: ({ row }) => (
                    <div className='justify-center'>
                        <Link to={`/edit/${row.original.id}`} className='font-medium bg-blue-400 hover:bg-blue-500 px-3 py-1 rounded text-white mr-1'>Edit</Link>
                        <button onClick={() => deleteProduct(row.original.id)} className='font-medium bg-red-400 hover:bg-red-500 px-3 py-1 rounded text-white'>Delete</button>
                    </div>
                ),
            },
        ],
        [deleteProduct]
    );

    const {
        getTableProps,
        getTableBodyProps,
        headerGroups,
        page,
        prepareRow,
        state,
        setGlobalFilter,
        canPreviousPage,
        canNextPage,
        pageOptions,
        pageCount,
        gotoPage,
        nextPage,
        previousPage,
        setPageSize,
    } = useTable(
        {
            columns,
            data: products,
            initialState: { pageIndex: 0, pageSize: 5 }, // Set initial page size to 5
        },
        useGlobalFilter,
        useSortBy,
        usePagination
    );

    const { globalFilter, pageIndex, pageSize } = state;

    if (error) return <h2>Error loading data...</h2>;
    if (!data) return <h2>Loading....</h2>;

    return (
        <div className='flex flex-col mt-5'>
            <div className="w-full mb-4">
                <Link to="/add" className='bg-green-500 hover:bg-green-700 border border-slate-200 text-white font-bold py-2 px-4 rounded-lg'>Add New</Link>
            </div>
            <div className="w-full mb-4">
                <GlobalFilter globalFilter={globalFilter} setGlobalFilter={setGlobalFilter} />
            </div>
            <div className="relative shadow rounded-lg mt-3">
                <table {...getTableProps()} className='w-full text-sm text-left text-gray-500'>
                    <thead className='text-xs text-gray-700 uppercase bg-gray-100'>
                        {headerGroups.map(headerGroup => (
                            <tr {...headerGroup.getHeaderGroupProps()}>
                                {headerGroup.headers.map(column => (
                                    <th {...column.getHeaderProps(column.getSortByToggleProps())} className='py-3 px-6'>
                                        {column.render('Header')}
                                        <span>
                                            {column.isSorted
                                                ? column.isSortedDesc
                                                    ? ' 🔽'
                                                    : ' 🔼'
                                                : ''}
                                        </span>
                                    </th>
                                ))}
                            </tr>
                        ))}
                    </thead>
                    <tbody {...getTableBodyProps()}>
                        {page.map(row => {
                            prepareRow(row);
                            return (
                                <tr {...row.getRowProps()} className='bg-white border-b'>
                                    {row.cells.map(cell => (
                                        <td {...cell.getCellProps()} className={`py-3 px-6 ${cell.column.id === 'Action' ? 'text-center' : ''}`}>
                                            {cell.column.id === 'Action' ? (
                                                <div>
                                                    {cell.render('Cell')}
                                                </div>
                                            ) : (
                                                cell.render('Cell')
                                            )}
                                        </td>
                                    ))}
                                </tr>
                            );
                        })}
                    </tbody>
                </table>
            </div>
            <div className={`flex justify-center items-center mt-4 ${pageSize > 5 ? 'mb-4' : ''}`}>
                <button onClick={() => gotoPage(0)} disabled={!canPreviousPage} className="px-2 py-1 border rounded mr-1">
                    {'<<'}
                </button>
                <button onClick={() => previousPage()} disabled={!canPreviousPage} className="px-2 py-1 border rounded mr-1">
                    {'<'}
                </button>
                <span className="px-2 py-1">
                    Page{' '}
                    <strong>
                        {pageIndex + 1} of {pageOptions.length}
                    </strong>{' '}
                </span>
                <button onClick={() => nextPage()} disabled={!canNextPage} className="px-2 py-1 border rounded mr-1">
                    {'>'}
                </button>
                <button onClick={() => gotoPage(pageCount - 1)} disabled={!canNextPage} className="px-2 py-1 border rounded">
                    {'>>'}
                </button>
                <select
                    value={pageSize}
                    onChange={e => setPageSize(Number(e.target.value))}
                    className="ml-2 border rounded py-1 px-2"
                >
                    {[5, 10, 20].map(size => (
                        <option key={size} value={size}>
                            Show {size}
                        </option>
                    ))}
                </select>
            </div>
        </div>
    );
};

export default ProductList;
