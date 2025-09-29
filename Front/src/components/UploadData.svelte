<script>
  import ExcelJS from "exceljs"; // Import ExcelJS
  import Sidebar from "./Sidebar.svelte";
  const apiUrl = import.meta.env.VITE_API_URL;
  import { Fileupload, Label, Helper, GradientButton } from "flowbite-svelte";

  let excelFile; // To hold the uploaded Excel file
  let isUploading = false; // To track the upload state
  let uploadedCount = 0; // To count the number of uploaded rows
  let updatedCount = 0; // To count the number of updated rows
  let totalRows = 0; // To store the total number of rows for progress tracking

  // Handle file input change
  function handleFileChange(event) {
    excelFile = event.target.files[0]; // Get the selected file from input
  }

  async function handleUploadExcel(event) {
    event.preventDefault();

    // Check if the file is selected
    if (!excelFile) {
      alert("Please select an Excel file to upload.");
      return;
    }

    isUploading = true; // Start the uploading process
    uploadedCount = 0; // Reset uploaded count
    updatedCount = 0; // Reset updated count
    const workbook = new ExcelJS.Workbook();

    try {
      // Load the Excel file
      await workbook.xlsx.load(await excelFile.arrayBuffer());

      // Check if the workbook has a sheet named "Upload"
      const worksheet = workbook.getWorksheet("Upload");
      if (!worksheet) {
        alert('The sheet named "Upload" was not found in the Excel file.');
        return;
      }

      // Extract data from the "Upload" sheet
      const jsonData = [];
      totalRows = worksheet.rowCount - 1; // Subtracting 1 for the header row

      worksheet.eachRow((row, rowNumber) => {
        if (rowNumber > 1) {
          // Skip header row
          // @ts-ignore
          jsonData.push(row.values.slice(1)); // Get values as an array, ignoring the first empty item
        }
      });

      // Function to upload in batches
      const uploadBatch = async (batchData) => {
        const response = await fetch(`/api/upload-excel`, {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify(batchData),
        });
        if (response.ok) {
          const result = await response.json();
          console.log("Backend response:", result); // Debugging line
          // Ensure result.added and result.updated are numbers
          uploadedCount += Number(result.added) || 0; // Increase uploaded count
          updatedCount += Number(result.updated) || 0; // Increase updated count
        } else {
          console.error("Upload failed:", response);
        }
      };

      // Upload the data in batches
      const batchSize = 100; // Adjust the batch size as needed
      for (let i = 0; i < jsonData.length; i += batchSize) {
        const batch = jsonData.slice(i, i + batchSize);
        await uploadBatch(batch);
      }

      alert(
        `${uploadedCount} rows added successfully, ${updatedCount} rows updated!`
      ); // Show success message
    } catch (error) {
      console.error("Error uploading Excel file:", error);
      alert("An error occurred while uploading the Excel file.");
    } finally {
      isUploading = false; // End the uploading process
    }
  }

  // refresh behold

  let isLoading = false;
  let message = "";

  const refreshBehold = async () => {
    isLoading = true; // Show loading state
    message = ""; // Reset message

    try {
      const response = await fetch(`/api/refresh-behold`, {
        method: "GET", // or 'GET' if your API accepts it
        headers: {
          "Content-Type": "application/json",
        },
      });

      if (!response.ok) {
        throw new Error(`Error: ${response.statusText}`);
      }

      const data = await response.json(); // Assuming your API returns a JSON response
      message = "Refresh successful!";
      console.log(data); // Log data if needed
    } catch (error) {
      console.error("Failed to refresh:", error);
      message = `Error: ${error.message}`;
    } finally {
      isLoading = false; // Hide loading state
    }
  };

  // refresh berita

  let kompasianaisLoading = false;
  let kompasianamessage = "";

  const refreshkompasiana = async () => {
    kompasianaisLoading = true; // Show loading state
    kompasianamessage = ""; // Reset message

    try {
      const response = await fetch(`/api/refresh-kompasiana`, {
        method: "GET", // or 'GET' if your API accepts it
        headers: {
          "Content-Type": "application/json",
        },
      });

      if (!response.ok) {
        throw new Error(`Error: ${response.statusText}`);
      }

      const data = await response.json(); // Assuming your API returns a JSON response
      kompasianamessage = "Refresh successful!";
      console.log(data); // Log data if needed
    } catch (error) {
      console.error("Failed to refresh:", error);
      kompasianamessage = `Error: ${error.message}`;
    } finally {
      kompasianaisLoading = false; // Hide loading state
    }
  };
</script>

<Sidebar />

<div class="grid grid-cols-1 xl:grid-cols-2 gap-4 mt-4 p-16">
  
  <div class="shadow-xl p-20 rounded-3xl bg-white mt-16">
    <h2 class="text-md font-bold">Update Data Instagram</h2>
    <GradientButton
      color="purpleToPink"
      on:click={refreshBehold}
      class="px-4 py-2 mt-32"
      disabled={isLoading}
    >
      {isLoading ? "Refreshing..." : "Refresh Instagram"}
    </GradientButton>
    {#if message}
      <p class="mt-2 text-sm text-gray-500">{message}</p>
    {/if}
  </div>
  <div class="shadow-xl p-20 rounded-3xl bg-white mt-16">
    <h2 class="text-md font-bold">Update Data Kompasiana</h2>
    <GradientButton
      color="cyanToBlue"
      on:click={refreshkompasiana}
      class="px-4 py-2 mt-32"
      disabled={kompasianaisLoading}
    >
      {kompasianaisLoading ? "Refreshing..." : "Refresh Kompasiana"}
    </GradientButton>
    {#if kompasianamessage}
      <p class="mt-2 text-sm text-gray-500">{kompasianamessage}</p>
    {/if}
  </div>
</div>

<style>
  .body {
    max-width: 1920px !important;
    max-height: 100% !important;
  }
</style>
