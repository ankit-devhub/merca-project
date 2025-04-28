'use client';
import { DataTable, DataTableSortStatus } from 'mantine-datatable';
import { useEffect, useState } from 'react';
import sortBy from 'lodash/sortBy';
import ReactSelect from 'react-select';
import IconLoader from './ui/icons/icon-loader';
import IconSearch from './ui/icons/icon-search';
import { getMonthlyReport, getPeriodlyReport } from '@/lib/api';
import ExcelJS from 'exceljs';
import { saveAs } from 'file-saver';
import IconFile from './ui/icons/icon-file';

export const List = () => {
    const [page, setPage] = useState(1);
    const PAGE_SIZES = [10, 20, 30, 50, 100];
    const [pageSize, setPageSize] = useState(PAGE_SIZES[4]);
    const [fetching, setFetching] = useState(false);
    const [search, setSearch] = useState('');
    const [sortStatus, setSortStatus] = useState<DataTableSortStatus>({
        columnAccessor: 'id',
        direction: 'asc',
    });

    const [data, setData] = useState<any[]>([]);
    const [filteredData, setFilteredData] = useState<any[]>([]);

    const handleFormSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
        e.preventDefault();
        setFetching(true);
        try {
            const formData = new FormData(e.currentTarget);
            const data = Object.fromEntries(formData.entries());
            const res = data?.type == 'period' ? await getPeriodlyReport(data.customerId as string) : await getMonthlyReport(data.customerId as string);
            setData(res);
        }
        catch (error) {
            console.error(error);
        } finally {
            setFetching(false);
        }
    }

    useEffect(() => {
        setFilteredData(() => {
            return data.filter((item: any) => {
                const keys = Object.keys(item);
                return keys.some(key => {
                    return typeof item[key] === 'string' && item[key].toLowerCase().includes(search.toLowerCase());
                });
            });
        });
        setPage(1);
    }, [search]);

    useEffect(() => {
        const data = sortBy(filteredData, sortStatus.columnAccessor);
        setFilteredData(sortStatus.direction === 'desc' ? data.reverse() : data);
        setPage(1);
    }, [sortStatus]);

    useEffect(() => {
        const from = (page - 1) * pageSize;
        const to = from + pageSize;
        setFilteredData([...data.slice(from, to)]);
    }, [page, pageSize, data]);

    useEffect(() => {
        setPage(1);
    }, [pageSize]);


    const exportTable = async (type) => {
        if (type !== 'xlsx' || data.length === 0) return;

        const workbook = new ExcelJS.Workbook();
        const worksheet = workbook.addWorksheet('Report');
        workbook.creator = 'Merca Project By Ankit Sharma';
        workbook.lastModifiedBy = 'Ankit Sharma';
        workbook.created = new Date();
        workbook.modified = new Date();

        worksheet.columns = Object.keys(data[0]).map((field) => ({
            header: field.charAt(0).toUpperCase() + field.slice(1),
            key: field,
            width: Math.max(10, field.length + 5),
        }));

        const rows = data.map((item, idx) => {
            const row = { id: idx + 1 };
            Object.keys(item).forEach((f) => {
                row[f] = item[f];
            });
            return row;
        });

        rows.forEach((r) => worksheet.addRow(r));

        const buffer = await workbook.xlsx.writeBuffer();
        const blob = new Blob([buffer], {
            type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
        });
        saveAs(blob, 'report.xlsx');
    };


    return (
        <>
            <div className="sticky top-0 z-10 w-full mt-6 panel">
                <div className="flex flex-col justify-between w-full gap-5 md:flex-row md:items-center">
                    <form onSubmit={handleFormSubmit} className='grid grid-flow-row grid-cols-1 gap-5 w-3/8 md:grid-cols-4'>
                        <div className="flex items-center ">
                            <label htmlFor="CM01" className="flex-1 mb-0 ltr:mr-2">
                                CM01
                            </label>
                            <input id="CM01" type="text" name="customerId" required className="form-input ml-4 w-2/3 lg:w-[250px]" placeholder={'Enter Customer ID'} />
                        </div>

                        <div className="flex items-center">
                            <label className="flex-1 mb-0 ltr:mr-2">
                                Type
                            </label>
                            <ReactSelect required isSearchable={true} name='type' className='w-2/3 ml-4 ltr:mr-3  lg:w-[250px]' options={[{ label: "Milestone", value: "period" }, { label: "Monthly", value: "monthly" }]} />
                        </div>
                        <button type="submit" className="w-1/3 btn btn-success">
                            {fetching ?
                                <div>
                                    <IconLoader className="inline-block align-middle animate-spin" />
                                </div> :
                                <div className='flex items-center gap-1 text-nowrap'>
                                    <IconSearch className="shrink-0 ltr:mr-1 rtl:ml-1" />
                                    Get Data
                                </div>}
                        </button>
                    </form>
                </div>
            </div>
            <div className="w-full mt-6 panel">
                <div className="mb-4.5 flex flex-col justify-between gap-5 md:flex-row md:items-center w-full">
                    <div>

                    </div>
                    <div className="flex flex-wrap items-center gap-6">
                        {
                            data.length > 0 &&
                            <button type="button" onClick={() => exportTable('xlsx')} className="flex gap-1 m-1 btn btn-primary btn-sm ">
                                <IconFile className="w-5 h-5 ltr:mr- rtl:ml-2" />
                                Download Excel Report
                            </button>
                        }
                        <input type="text" className="w-auto min-w-72 form-input" placeholder="Type to find..." value={search} onChange={(e) => setSearch(e.target.value)} />
                    </div>
                </div>
                <div className="datatables">
                    <DataTable
                        highlightOnHover
                        fetching={fetching}
                        loaderVariant='bars'
                        loadingText='Loading...'
                        paginationSize='sm'
                        className="table-hover whitespace-nowrap"
                        records={filteredData.map((item, i) => ({
                            ...item, id: i + 1
                        }))}
                        columns={data.length ? Object.keys(data[0]).map((key) => {
                            return {
                                accessor: key,
                                title: key.charAt(0).toUpperCase() + key.slice(1),
                                sortable: true,
                            }
                        }) : []}
                        totalRecords={data.length}
                        recordsPerPage={pageSize}
                        page={page}
                        customRowAttributes={(row) => ({ 'data-id': row.id })}
                        onPageChange={(p) => setPage(p)}
                        recordsPerPageOptions={PAGE_SIZES}
                        onRecordsPerPageChange={setPageSize}
                        sortStatus={sortStatus}
                        onSortStatusChange={setSortStatus}
                        minHeight={200}
                        classNames={{ header: 'z-0' }}
                        paginationText={({ from, to, totalRecords }) => `Showing  ${from} to ${to} of ${totalRecords} entries`}
                    />
                </div>
            </div>
        </>
    );
};

