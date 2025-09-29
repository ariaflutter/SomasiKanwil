<script>
    // You can import data or use static content here
    let title = "Welcome to Your Dashboard";
    let information = "This is a simple dashboard where you can display information.";
</script>

<style>
    .dashboard {
        display: flex;
        flex-direction: column;
        align-items: center;
        justify-content: center;
        min-height: 100vh;
        background-color: #f0f2f5;
    }
    
    .header {
        background-color: #4CAF50;
        color: white;
        padding: 15px;
        width: 100%;
        text-align: center;
    }
    
  
</style>

<div class="dashboard">
    <div class="header">
        <h1>{title}</h1>
        <h2>{information}</h2>
    </div>
    
</div>
