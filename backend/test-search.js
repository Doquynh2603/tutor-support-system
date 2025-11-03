// Test file to check if SearchModel loads correctly
const SearchModel = require("./src/models/SearchModel");

console.log("✅ SearchModel imported successfully");
console.log("SearchModel.searchClasses:", typeof SearchModel.searchClasses);

// Test calling searchClasses
SearchModel.searchClasses({ status: "recruiting" })
  .then((result) => {
    console.log("✅ searchClasses executed successfully");
    console.log("Results count:", result.length);
  })
  .catch((error) => {
    console.error("❌ Error:", error.message);
  });
