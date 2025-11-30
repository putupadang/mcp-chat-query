/**
 * Run database query tool handler (admin only)
 * This is a mock implementation with safety checks
 */

const runQueryHandler = async ({ query, database = "default" }) => {
  // Simulate async query execution
  await new Promise((resolve) => setTimeout(resolve, 200));

  // Safety check: prevent destructive operations
  const dangerousKeywords = ["drop", "delete", "truncate", "alter"];
  const queryLower = query.toLowerCase();

  for (const keyword of dangerousKeywords) {
    if (queryLower.includes(keyword)) {
      throw new Error(
        `Dangerous operation '${keyword}' not allowed via this tool`
      );
    }
  }

  // Mock query result
  return {
    database,
    query,
    rows: [
      { id: 1, value: "Sample Row 1" },
      { id: 2, value: "Sample Row 2" },
      { id: 3, value: "Sample Row 3" },
    ],
    rowCount: 3,
    executionTime: "0.042s",
  };
};

module.exports = runQueryHandler;
