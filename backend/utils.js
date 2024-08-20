function getDateAggregation(interval, createdAtField) {
  let dateAggregation;
  switch (interval) {
    case "daily":
      dateAggregation = {
        year: { $year: createdAtField },
        month: { $month: createdAtField },
        day: { $dayOfMonth: createdAtField },
      };
      break;
    case "monthly":
      dateAggregation = {
        year: { $year: createdAtField },
        month: { $month: createdAtField },
      };
      break;
    case "quarterly":
      dateAggregation = {
        year: { $year: createdAtField },
        quarter: { $ceil: { $divide: [{ $month: createdAtField }, 3] } },
      };
      break;
    case "yearly":
      dateAggregation = { year: { $year: createdAtField } };
      break;
    default:
      throw new Error(
        'Invalid interval. Must be one of "daily", "monthly", "quarterly", or "yearly".'
      );
  }
  return dateAggregation;
}

module.exports = { getDateAggregation };
