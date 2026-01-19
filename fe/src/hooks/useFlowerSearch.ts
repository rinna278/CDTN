import { normalizeText } from './../utils/normalizeText';
import { useState, useEffect } from "react";
import { getAllProduct, searchFlower } from "../services/apiService";
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

       const response = await searchFlower({
         page: 1,
         limit: 1000,
         occasions: [occasion],
         status: 1,
       });

       const normalizedSearch = normalizeText(searchQuery);

       const filtered = normalizedSearch
         ? response.data.filter((p) =>
             normalizeText(p.name).includes(normalizedSearch),
           )
         : response.data;

       const start = (currentPage - 1) * itemsPerPage;
       const paginated = filtered.slice(start, start + itemsPerPage);

       setFlowers(paginated);
       setTotalPages(Math.ceil(filtered.length / itemsPerPage));
     } catch (e: any) {
       setError(e.message);
     } finally {
       setLoading(false);
     }
   };

   fetchFlowers();
 }, [searchQuery, currentPage, occasion, itemsPerPage]);



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