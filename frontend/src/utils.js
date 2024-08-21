export const convertMonthIndexToAbbreviation = (monthIndex) => {
  const monthAbbreviations = [
    "Jan",
    "Feb",
    "Mar",
    "Apr",
    "May",
    "Jun",
    "Jul",
    "Aug",
    "Sep",
    "Oct",
    "Nov",
    "Dec",
  ];

  if (monthIndex < 1 || monthIndex > 12) {
    throw new Error("Month index must be between 1 and 12");
  }

  return monthAbbreviations[monthIndex - 1];
};
