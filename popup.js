document.addEventListener('DOMContentLoaded', function() {
  const quoteList = document.getElementById('quoteList');
  const quoteCount = document.getElementById('quoteCount');
  const searchInput = document.getElementById('searchInput');
  const exportMarkdownBtn = document.getElementById('exportMarkdownBtn');
  const exportCsvBtn = document.getElementById('exportCsvBtn');
  const exportJsonBtn = document.getElementById('exportJsonBtn');
  const deleteAllBtn = document.getElementById('deleteAllBtn');
  const pagination = document.getElementById('pagination');

  let quotes = [];
  let currentPage = 1;
  const quotesPerPage = 5;

  function updateQuoteList() {
    const searchTerm = searchInput.value.toLowerCase();
    const filteredQuotes = quotes.filter(quote => 
      quote.text.toLowerCase().includes(searchTerm) || 
      quote.formattedQuote.toLowerCase().includes(searchTerm)
    );

    const totalPages = Math.ceil(filteredQuotes.length / quotesPerPage);
    const start = (currentPage - 1) * quotesPerPage;
    const end = start + quotesPerPage;
    const paginatedQuotes = filteredQuotes.slice(start, end);

    quoteCount.textContent = `收藏数量: ${filteredQuotes.length}`;
    quoteList.innerHTML = paginatedQuotes.length ? paginatedQuotes.map((quote, index) => `
      <li>
        <div class="quote-card">
          <div class="quote-text">${quote.text}</div>
          <div class="quote-source">${quote.formattedQuote}</div>
          <button class="edit-btn" data-index="${index}">编辑</button>
          <button class="delete-btn" data-index="${index}">删除</button>
        </div>
      </li>
    `).join('') : '<li>暂无收藏内容</li>';

    pagination.innerHTML = Array.from({ length: totalPages }, (_, i) => `
      <button class="page-btn ${i + 1 === currentPage ? 'active' : ''}" data-page="${i + 1}">${i + 1}</button>
    `).join('');

    document.querySelectorAll('.edit-btn').forEach(btn => {
      btn.addEventListener('click', () => {
        const index = btn.getAttribute('data-index');
        const newText = prompt("编辑引用文本:", quotes[index].text);
        const newFormattedQuote = prompt("编辑链接:", quotes[index].formattedQuote);
        if (newText !== null && newFormattedQuote !== null) {
          quotes[index] = { ...quotes[index], text: newText, formattedQuote: newFormattedQuote };
          chrome.storage.sync.set({ quotes }, updateQuoteList);
        }
      });
    });

    document.querySelectorAll('.delete-btn').forEach(btn => {
      btn.addEventListener('click', () => {
        const index = btn.getAttribute('data-index');
        quotes.splice(index, 1);
        chrome.storage.sync.set({ quotes }, updateQuoteList);
      });
    });

    document.querySelectorAll('.page-btn').forEach(btn => {
      btn.addEventListener('click', () => {
        currentPage = parseInt(btn.getAttribute('data-page'));
        updateQuoteList();
      });
    });
  }

  searchInput.addEventListener('input', updateQuoteList);

  exportMarkdownBtn.addEventListener('click', () => {
    if (!quotes.length) {
      alert('没有可导出的内容');
      return;
    }
    const markdown = quotes.map(q => `- [ ] ${q.text}\n  ${q.formattedQuote}`).join('\n\n');
    const blob = new Blob([markdown], { type: 'text/markdown' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'quotes.md';
    a.click();
    URL.revokeObjectURL(url);
  });

  exportCsvBtn.addEventListener('click', () => {
    if (!quotes.length) {
      alert('没有可导出的内容');
      return;
    }
    const csv = quotes.map(q => `"${q.text}","${q.formattedQuote}"`).join('\n');
    const blob = new Blob([csv], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'quotes.csv';
    a.click();
    URL.revokeObjectURL(url);
  });

  exportJsonBtn.addEventListener('click', () => {
    if (!quotes.length) {
      alert('没有可导出的内容');
      return;
    }
    const json = JSON.stringify(quotes, null, 2);
    const blob = new Blob([json], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'quotes.json';
    a.click();
    URL.revokeObjectURL(url);
  });

  deleteAllBtn.addEventListener('click', () => {
    if (confirm('确定要删除所有收藏内容吗？')) {
      chrome.storage.sync.set({ quotes: [] }, updateQuoteList);
    }
  });

  chrome.storage.sync.get('quotes', function(data) {
    quotes = data.quotes || [];
    updateQuoteList();
  });
});