import { useState, useEffect } from "react";
import { getAllProduct } from "../services/apiService";
import { useSearch } from "../components/context/SearchContext";
import { Product } from "../types/type";

interface UseFlowerSearchProps {
  occasion: string;
  itemsPerPage?: number;
}

export const useFlowerSearch = ({
  occasion,
  itemsPerPage = 10,
}: UseFlowerSearchProps) => {
  const { searchQuery } = useSearch();
  const [currentPage, setCurrentPage] = useState(1);
  const [sortOption, setSortOption] = useState("all");
  const [flowers, setFlowers] = useState<Product[]>([]);
  const [totalPages, setTotalPages] = useState(0);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const getSortParams = (option: string) => {
    switch (option) {
      case "a-z":
        return { sortBy: "name", sortOrder: "ASC" as const };
      case "z-a":
        return { sortBy: "name", sortOrder: "DESC" as const };
      case "expensive-cheaper":
        return { sortBy: "price", sortOrder: "DESC" as const };
      case "cheaper-expensive":
        return { sortBy: "price", sortOrder: "ASC" as const };
      default:
        return { sortBy: "createdAt", sortOrder: "DESC" as const };
    }
  };

  useEffect(() => {
    const fetchFlowers = async () => {
      try {
        setLoading(true);
        const sortParams = getSortParams(sortOption);

        const response = await getAllProduct({
          page: currentPage,
          limit: itemsPerPage,
          occasions: [occasion],
          status: 1,
          search: searchQuery,
          ...sortParams,
        });

        setFlowers(response.data || []);
        setTotalPages(response.totalPages || 0);
      } catch (err: any) {
        setError(err.message);
        setFlowers([]);
      } finally {
        setLoading(false);
      }
    };

    fetchFlowers();
  }, [currentPage, sortOption, searchQuery, occasion,itemsPerPage]);

  useEffect(() => {
    if (searchQuery) setCurrentPage(1);
  }, [searchQuery]);

  return {
    flowers,
    totalPages,
    loading,
    error,
    currentPage,
    setCurrentPage,
    sortOption,
    setSortOption,
  };
};
