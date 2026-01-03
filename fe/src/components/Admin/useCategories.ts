import { useState, useEffect } from "react";

interface Category {
  id: string;
  name: string;
  productCount: number;
}

export const useCategories = () => {
  const [categories, setCategories] = useState<string[]>([]);

  // Load categories từ localStorage
  const loadCategories = () => {
    const savedCategories = localStorage.getItem("productCategories");
    if (savedCategories) {
      const parsed: Category[] = JSON.parse(savedCategories);
      return parsed.map((cat) => cat.name);
    }

    // Danh mục mặc định
    return ["Hoa Hồng", "Hoa Tulip", "Hoa Cúc", "Hoa Ly"];
  };

  useEffect(() => {
    setCategories(loadCategories());

    // Lắng nghe sự thay đổi của localStorage
    const handleStorageChange = () => {
      setCategories(loadCategories());
    };

    window.addEventListener("storage", handleStorageChange);

    // Custom event để lắng nghe thay đổi trong cùng tab
    window.addEventListener("categoriesUpdated", handleStorageChange);

    return () => {
      window.removeEventListener("storage", handleStorageChange);
      window.removeEventListener("categoriesUpdated", handleStorageChange);
    };
  }, []);

  return categories;
};

// Helper function để trigger event khi categories thay đổi
export const triggerCategoriesUpdate = () => {
  window.dispatchEvent(new Event("categoriesUpdated"));
};
