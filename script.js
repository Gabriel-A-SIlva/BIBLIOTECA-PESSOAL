// =======================
// LOCAL STORAGE HELPERS
// =======================
function getBooks() {
    return JSON.parse(localStorage.getItem('books')) || [];
}

function saveBooks(books) {
    localStorage.setItem('books', JSON.stringify(books));
}

function getCategories() {
    return JSON.parse(localStorage.getItem('categories')) || [];
}

function saveCategories(categories) {
    localStorage.setItem('categories', JSON.stringify(categories));
}

// =======================
// SPA NAVIGATION
// =======================
const menuItems = document.querySelectorAll('.menu-item');
const screens = document.querySelectorAll('.screen');

menuItems.forEach((item) => {
    item.addEventListener('click', (e) => {
        e.preventDefault();

        // Reset details panel when navigating
        document.getElementById('detailsContent').innerHTML = `
      <div class="empty-details">
        <i class="fas fa-book-reader"></i>
        <p>Select a book to view details</p>
      </div>
    `;

        menuItems.forEach((i) => i.classList.remove('active'));
        item.classList.add('active');

        screens.forEach((s) => s.classList.remove('active'));
        const targetScreen = document.getElementById(item.dataset.target);
        targetScreen.classList.add('active');
    });
});

// =======================
// FILE UPLOAD VISUALS
// =======================
const coverInput = document.getElementById('coverInput');
const fileNameDisplay = document.getElementById('fileName');

coverInput.addEventListener('change', (e) => {
    if (e.target.files.length > 0) {
        fileNameDisplay.textContent = e.target.files[0].name;
    } else {
        fileNameDisplay.textContent = 'No file chosen';
    }
});

// =======================
// ADD BOOK
// =======================
document.getElementById('addBook').addEventListener('click', () => {
    const file = coverInput.files[0];
    const titleVal = document.getElementById('title').value;
    const authorVal = document.getElementById('author').value;
    const categoryVal = document.getElementById('categoryInput').value;
    const publisherVal = document.getElementById('publisher').value;
    const descriptionVal = document.getElementById('description').value;

    if (!file || !titleVal || !authorVal) {
        alert('Please provide at least a Title, Author, and a Cover Image.');
        return;
    }

    const reader = new FileReader();

    reader.onload = () => {
        const book = {
            id: Date.now(),
            title: titleVal,
            author: authorVal,
            category: categoryVal || 'Uncategorized',
            publisher: publisherVal,
            description: descriptionVal || 'No description provided.',
            cover: reader.result,
        };

        const books = getBooks();
        books.push(book);
        saveBooks(books);

        renderLibrary();
        renderHome(getBooks());
        clearForm();
        alert('Book added successfully!');
    };

    reader.readAsDataURL(file);
});

// =======================
// CLEAR FORM
// =======================
function clearForm() {
    document.getElementById('title').value = '';
    document.getElementById('author').value = '';
    document.getElementById('categoryInput').value = '';
    document.getElementById('publisher').value = '';
    document.getElementById('description').value = '';
    coverInput.value = '';
    fileNameDisplay.textContent = 'No file chosen';
}

// =======================
// RENDER MY LIBRARY
// =======================
function renderLibrary() {
    const grid = document.getElementById('libraryGrid');
    grid.innerHTML = '';
    const books = getBooks();

    if (books.length === 0) {
        grid.innerHTML = `<p style="color: var(--text-gray); grid-column: 1/-1;">Your library is empty. Add your first book above!</p>`;
        return;
    }

    books.forEach((book) => {
        const card = document.createElement('div');
        card.className = 'card';

        card.innerHTML = `
      <img src="${book.cover}" alt="Cover">
      <div class="card-info">
        <strong>${book.title}</strong>
        <span>${book.author}</span>
      </div>
      <button class="btn-delete"><i class="fas fa-trash"></i> Delete</button>
    `;

        card.querySelector('.btn-delete').onclick = (e) => {
            e.stopPropagation(); // Previne o clique no card de abrir os detalhes
            const newBooks = getBooks().filter((b) => b.id !== book.id);
            saveBooks(newBooks);
            renderLibrary();
            renderHome(newBooks);
            document.getElementById('detailsContent').innerHTML = `
        <div class="empty-details">
          <i class="fas fa-book-reader"></i>
          <p>Select a book to view details</p>
        </div>
      `;
        };

        grid.appendChild(card);
    });
}

// =======================
// RENDER HOME
// =======================
function renderHome(booksToRender) {
    const home = document.getElementById('homeCards');
    home.innerHTML = '';

    if (booksToRender.length === 0) {
        home.innerHTML = `<p style="color: var(--text-gray); grid-column: 1/-1;">No books found.</p>`;
        return;
    }

    booksToRender.forEach((book) => {
        const card = document.createElement('div');
        card.className = 'card';

        card.innerHTML = `
      <img src="${book.cover}" alt="Cover">
      <div class="card-info">
        <strong>${book.title}</strong>
        <span>${book.author}</span>
      </div>
    `;

        card.onclick = () => showDetails(book);
        home.appendChild(card);
    });
}

// =======================
// DETAILS PANEL
// =======================
function showDetails(book) {
    const detailsPanel = document.getElementById('detailsContent');

    detailsPanel.innerHTML = `
    <div class="details-card fade-in">
      <img src="${book.cover}" alt="Cover">
      <h3>${book.title}</h3>
      <p class="author">By ${book.author}</p>
      
      <div class="meta">
        <span><i class="fas fa-tag"></i> ${book.category}</span>
        <span><i class="fas fa-building"></i> ${book.publisher || 'N/A'}</span>
      </div>

      <p class="desc">${book.description}</p>
      
      <button class="btn-read"><i class="fas fa-book-open"></i> Start Reading</button>
    </div>
  `;
}

// =======================
// CATEGORIES
// =======================
document.getElementById('addCategory').addEventListener('click', () => {
    const categoryName = document.getElementById('categoryName');
    if (!categoryName.value.trim()) return;

    const categories = getCategories();
    if (!categories.includes(categoryName.value.trim())) {
        categories.push(categoryName.value.trim());
        saveCategories(categories);
    }

    categoryName.value = '';
    renderCategories();
});

function renderCategories() {
    const list = document.getElementById('categoriesList');
    const homeFilters = document.getElementById('homeFilters');

    list.innerHTML = '';
    homeFilters.innerHTML = '';

    const allCategories = ['All', ...getCategories()];

    allCategories.forEach((cat, index) => {
        // Para a tela de gerenciamento
        if (cat !== 'All') {
            const spanList = document.createElement('span');
            spanList.className = 'pill';
            spanList.textContent = cat;
            list.appendChild(spanList);
        }

        // Para os filtros na tela Home
        const spanFilter = document.createElement('span');
        spanFilter.className = index === 0 ? 'pill active' : 'pill';
        spanFilter.textContent = cat;

        spanFilter.onclick = () => {
            // Remove a classe active de todos
            document
                .querySelectorAll('#homeFilters .pill')
                .forEach((p) => p.classList.remove('active'));
            spanFilter.classList.add('active');

            const books = getBooks();
            renderHome(
                cat === 'All' ? books : books.filter((b) => b.category === cat),
            );
        };

        homeFilters.appendChild(spanFilter);
    });
}

// =======================
// SEARCH
// =======================
document.getElementById('searchInput').addEventListener('input', (e) => {
    const term = e.target.value.toLowerCase();
    const books = getBooks().filter(
        (b) =>
            b.title.toLowerCase().includes(term) ||
            b.author.toLowerCase().includes(term),
    );

    // Muda para a aba home caso faça uma pesquisa estando em outra aba
    document.querySelector('[data-target="home"]').click();

    // Reseta os filtros
    document
        .querySelectorAll('#homeFilters .pill')
        .forEach((p) => p.classList.remove('active'));
    const firstFilter = document.querySelector('#homeFilters .pill');
    if (firstFilter) firstFilter.classList.add('active');

    renderHome(books);
});

// =======================
// INIT
// =======================
renderLibrary();
renderHome(getBooks());
renderCategories();
// =======================
// THEME TOGGLE (DARK/LIGHT)
// =======================
const themeToggle = document.getElementById('themeToggle');
const themeIcon = themeToggle.querySelector('i');
const body = document.body;

// Verifica no LocalStorage se já existe um tema guardado
const savedTheme = localStorage.getItem('theme');

// Verifica a preferência do sistema operativo (se o utilizador usa dark mode no PC)
const systemPrefersDark = window.matchMedia(
    '(prefers-color-scheme: dark)',
).matches;

// Aplica o tema inicial
if (savedTheme === 'dark' || (!savedTheme && systemPrefersDark)) {
    body.setAttribute('data-theme', 'dark');
    themeIcon.classList.replace('fa-moon', 'fa-sun');
}

// Evento de clique para alternar
themeToggle.addEventListener('click', () => {
    if (body.getAttribute('data-theme') === 'dark') {
        // Muda para Light
        body.removeAttribute('data-theme');
        localStorage.setItem('theme', 'light');
        themeIcon.classList.replace('fa-sun', 'fa-moon');
    } else {
        // Muda para Dark
        body.setAttribute('data-theme', 'dark');
        localStorage.setItem('theme', 'dark');
        themeIcon.classList.replace('fa-moon', 'fa-sun');
    }
});
