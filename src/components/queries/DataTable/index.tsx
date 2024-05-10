"use client";

import { FC, useCallback, useState } from "react";
import { ArrowUpIcon, ArrowDownIcon } from "@heroicons/react/20/solid";
import { useQuery } from "@/hooks/useQuery";
import classnames from "classnames";
import classNames from "classnames";
import { CSVDownload } from "./CSVDownload";
import { usePathname, useRouter, useSearchParams } from "next/navigation";

export type Props = {
  id: string;
};

export const DataTable: FC<Props> = ({ id }) => {
  const { query, sortQueryBy, order, orderBy, loading } = useQuery(id);
  const params = useSearchParams();
  const router = useRouter();
  const pathname = usePathname();
  const [page, setPageDirectly] = useState<number>(Number(params.get('page')) || 1 );
  const [limit, setLimit] = useState<number>(Number(params.get('limit')) || 10);
  const [startIndex, setStartIndex] = useState<number>(page > 1 ? limit * (page-1) : 0)
  const [endIndex, setEndIndex] = useState<number>(limit*page)
  
  const updateUrl = useCallback(
    ({
      newPage,
      newLimit,
    }: {
      newPage?: number;
      newLimit?: number;
    }) => {
      const newParams = new URLSearchParams({
        page: `${newPage === undefined ? page : newPage}`,
        limit: `${newLimit === undefined ? limit : newLimit}`,
      });
      page > 1 ? setStartIndex(limit * (page-1)) : setStartIndex(0);
      setEndIndex(limit*page)
      router.replace(`${pathname}?${newParams.toString()}`);
    },
    [page, limit, pathname, router, startIndex, endIndex],
  );
  console.log(startIndex, endIndex, " INDEXES, PAGE: ", page, " limit ", limit)

  const renderValue = (v: any) => {
    return (
      <span
      className=""
        dangerouslySetInnerHTML={{
          __html: typeof v === "string" ? v : JSON.stringify(v),
        }}
      />
    );
  };

  const previousPage = () => {
    const newPage = Math.max(page - 1, 1);
    setPageDirectly(newPage);
    updateUrl({ newPage });
  };

  const nextPage = () => {
    const newPage = page + 1;
    setPageDirectly(newPage);
    updateUrl({ newPage });
  };

  const changeLimit = (value: number) => {
    const newLimit = Math.min(value, 100);
    setLimit(newLimit);
    setPageDirectly(1);
    updateUrl({ newLimit, newPage: 1 });
  };

  const result = query?.run?.result;
  const error = query?.run?.error;

    if (error) console.log(error, " ERROR ")
      
  // TODO: give a proper error message
  if (!result && !error) {
    return null;
  }


  return (<>{
    result ? (
    <div>
    <header>
      <h2 className="text-lg font-semibold text-gray-700 dark:text-gray-200">
        {query.name}
      </h2>
      <CSVDownload queryId={id} />
    </header>
    <section className="w-full max-w-fit overflow-auto ">
      <table
        className={classnames(
          "my-24 text-sm text-left rtl:text-right text-gray-500 dark:text-gray-400 rounded-md table-fixed",
          loading && "animate-pulse",
        )}
      >
        <thead className="text-xs text-gray-700 uppercase bg-gray-100 dark:bg-gray-700 dark:text-gray-400">
          <tr>
            {result.fields.map((field, i) => (
              <th
                scope="col"
                className={classNames(
                  "px-6 py-3 sticky",
                  i === 0 && "rounded-tl-md",
                  i === result.fields.length - 1 && "rounded-tr-md",
                )}
                key={field.name}
              >
                <button onClick={() => sortQueryBy(field.name)}>
                  {field.name}
                </button>
                {orderBy === field.name ? (
                  order === "desc" ? (
                    <ArrowUpIcon className="h-4 w-4 inline" />
                  ) : (
                    <ArrowDownIcon className="h-4 w-4 inline" />
                  )
                ) : null}
              </th>
            ))}
          </tr>
        </thead>
        <tbody className="overflow-hidden">
          {result.rows.slice(startIndex, endIndex).map((row, i) => (
            <tr
              key={i}
              className={classNames(
                "bg-white dark:bg-gray-800 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-600 h-8",
                i !== result.rows.length - 1 && "border-b",
              )}
            >
              {Object.values(row).map((value, j) => (
                <td
                  key={j}
                  className={classNames(
                    "px-6 py-4",
                    i === result.rows.length - 1 && j === 0 && "rounded-bl-md",
                    i === result.rows.length - 1 &&
                      j === result.fields.length - 1 &&
                      "rounded-br-md",
                  )}
                >
                  {renderValue(value)}
                </td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
    </section>
        <tfoot className=" w-100v ">
        <tr>
          <td colSpan={3} className="px-6 py-4 w-full flex items-center justify-between">
            <div>
              <select
                onChange={(event) => changeLimit(parseInt(event.target.value))}
                value={limit}
              >
                <option value={10}>10</option>
                <option value={25}>25</option>
                <option value={50}>50</option>
                <option value={100}>100</option>
              </select>
            </div>
            <div >
              <button disabled={page === 1} onClick={previousPage}>
                Previous Page
              </button>
              <button onClick={nextPage}>Next Page</button>
            </div>
          </td>
        </tr>
      </tfoot>
    </div>) : (
      <div>
        <p>{error?.name}</p>
        <p>{error?.routine}</p>
      </div>
    )}</>
  );
};
