const sortData = (header, data, sort, setSort, setData) => {
    // Ensure sort is properly initialized
    const defaultSort = { keyToSort: "", direction: "asc" };
    const updatedSort = {
      ...defaultSort,
      ...sort,
      keyToSort: header.id,
      direction:
        sort.keyToSort === header.id ? (sort.direction === "asc" ? "desc" : "asc") : "asc",
    };
    
    // Update sort state
    setSort(updatedSort);
  
    // Perform sorting
    const sortedData = [...data].sort((a, b) => {
      const valueA = a[header.id];
      const valueB = b[header.id];
      if (valueA < valueB) {
        return updatedSort.direction === "asc" ? -1 : 1;
      }
      if (valueA > valueB) {
        return updatedSort.direction === "asc" ? 1 : -1;
      }
      return 0;
    });
  
    // Update data state
    setData(sortedData);
  };
  
  export default sortData;
  