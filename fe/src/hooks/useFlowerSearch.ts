import { useState, useEffect } from "react";
import { searchFlower } from "../services/apiService";
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

  useEffect(() => {
    const fetchFlowers = async () => {
      try {
        setLoading(true);

        const response = await searchFlower({
          search: searchQuery || undefined, // 👈 CHỈ TRUYỀN INPUT
          page: currentPage,
          limit: itemsPerPage,
          occasions: [occasion],
          status: 1,
        });

        setFlowers(response.data);
        setTotalPages(response.totalPages);
      } catch (err: any) {
        setError(err.message || "Có lỗi xảy ra");
        setFlowers([]);
      } finally {
        setLoading(false);
      }
    };

    fetchFlowers();
  }, [searchQuery, currentPage, occasion, itemsPerPage]);

  // reset page khi search
  useEffect(() => {
    setCurrentPage(1);
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
