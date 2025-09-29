<script>
    import { marked } from 'marked';




    let message = '';
    let loading = false;
  
    let chatHistory = [
      {
        role: 'system',
        content: 'You are a helpful AI assistant that answers in a friendly and clear way.'
      }
    ];
  
    async function sendMessage() {
      if (!message.trim()) return;
  
      chatHistory.push({ role: 'user', content: message });
      message = '';
      loading = true;
  
      try {
        const res = await fetch(`http://bapasjember.net:5000/api/chat`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ messages: chatHistory })
        });
  
        const data = await res.json();
  
        chatHistory.push({ role: 'assistant', content: data.response || '⚠️ No reply.' });
      } catch (err) {
        console.error('Fetch error:', err);
        chatHistory.push({ role: 'assistant', content: '⚠️ Error talking to AI.' });
      }
  
      loading = false;
      chatHistory = [...chatHistory]; // Force reactivity
    }
  </script>
  
  <main>
    <h1>🧠 AI Assistant</h1>
  
    <div class="chat-window">
      {#each chatHistory.slice(1) as m}
        <div class={m.role}>
          <strong>{m.role === 'user' ? 'You' : 'AI'}:</strong>
          <div class="bubble">
            {@html marked.parse(m.content || '')}
          </div>
        </div>
      {/each}
    </div>
  
    <textarea
      bind:value={message}
      placeholder="Type your message..."
      rows="3"
    ></textarea>
  
    <button on:click={sendMessage} disabled={loading}>
      {loading ? 'Thinking...' : 'Send'}
    </button>
  </main>
  
  <style>
    main {
      max-width: 700px;
      margin: auto;
      font-family: sans-serif;
      padding: 2rem;
    }
  
    .chat-window {
      background: #f9f9f9;
      padding: 1rem;
      border-radius: 10px;
      max-height: 500px;
      overflow-y: auto;
      margin-bottom: 1rem;
    }
  
    .user, .assistant {
      margin-bottom: 1rem;
    }
  
    .user .bubble {
      background: #daf6da;
      padding: 0.75rem;
      border-radius: 10px;
      text-align: right;
    }
  
    .assistant .bubble {
      background: #ffffff;
      padding: 0.75rem;
      border-radius: 10px;
      text-align: left;
    }
  
    textarea {
      width: 100%;
      padding: 1rem;
      font-size: 1rem;
      margin-bottom: 0.5rem;
      border-radius: 10px;
      border: 1px solid #ccc;
    }
  
    button {
      background-color: #333;
      color: white;
      padding: 0.75rem 1.5rem;
      border: none;
      border-radius: 10px;
      font-size: 1rem;
      cursor: pointer;
    }
  
    button[disabled] {
      opacity: 0.6;
      cursor: not-allowed;
    }
  </style>
  