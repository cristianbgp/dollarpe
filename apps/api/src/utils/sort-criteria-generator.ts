export default function sortCriteriaGenerator<T>(
  accessor: (obj: T) => string | number,
  { asc = true, desc = false },
) {
  return (a: T, b: T) => {
    const textA = accessor(a);
    const textB = accessor(b);
    if (typeof textA === "number" && typeof textB === "number") {
      return asc && !desc ? textA - textB : textB - textA;
    }
    if (typeof textA === "string" && typeof textB === "string") {
      return asc && !desc
        ? textA.localeCompare(textB)
        : textB.localeCompare(textA);
    }
    throw new Error("Invalid type");
  };
}
