document.addEventListener('DOMContentLoaded', function () {
  const submitForm = document.getElementById('bookForm');

  if (isStorageExist()) {
    bookFromStorage();
  }

  submitForm.addEventListener('submit', function (event) {
    event.preventDefault();
    addBook();
  })
})

const books = []
const RENDER_EVENT = 'render-book'
const STORAGE_KEY = 'BOOKS_APPS'

function addBook() {
  const judul = document.getElementById('bookFormTitle');
  const author= document.getElementById('bookFormAuthor');
  const year = Number(document.getElementById('bookFormYear').value);
  const isComplete = document.getElementById('bookFormIsComplete');
  const editingId = judul.dataset.editingId;

  if (editingId) {
    const bookIndex = findBookindex(Number(editingId));
    if (bookIndex !== -1) {
      books[bookIndex].title = judul.value;
      books[bookIndex].author = author.value;
      books[bookIndex].year = year;
      books[bookIndex].isComplete = isComplete.checked;

    }
    delete judul.dataset.editingId;
  } else {

    const bookId = generatedId();
    const bookObject = generatedBookObject(
      bookId,
      judul.value,
      author.value,
      year,
      isComplete.checked
    );
    books.push(bookObject);

  }




  document.dispatchEvent(new Event(RENDER_EVENT));
  saveBook()

  judul.value = '';
  author.value = '';
  document.getElementById('bookFormYear').value = '';
  isComplete.checked = false;



}

function generatedId() {
  return + new Date()
}

function generatedBookObject(id, title, author, year, isComplete) {
  return {
    id,
    title,
    author,
    year,
    isComplete
  }
}

document.addEventListener(RENDER_EVENT, function () {
  const uncompleted = document.getElementById('incompleteBookList')
  const completed = document.getElementById('completeBookList')

  completed.innerHTML = '';
  uncompleted.innerHTML = '';




  for (const bookItem of books) {
    const bookElement = elementBook(bookItem);
    if (!bookItem.isComplete) {
      uncompleted.append(bookElement)
    } else {
      completed.append(bookElement)
    }
  }

})

function elementBook(bookObject) {

  const itemBook = document.createElement('div');
  itemBook.classList.add('item-book')
  itemBook.setAttribute('data-bookid', bookObject.id);
  itemBook.setAttribute('data-testid', 'bookItem')

  const titleBook = document.createElement('h3');
  titleBook.innerText = bookObject.title;
  titleBook.setAttribute('data-testid', 'bookItemTitle')
  itemBook.appendChild(titleBook);

  const authorBook = document.createElement('p');
  authorBook.textContent = `Penulis :  ${bookObject.author}`;
  authorBook.setAttribute('data-testid', 'bookItemAuthor')
  itemBook.appendChild(authorBook)

  const yearBook = document.createElement('p');
  yearBook.textContent = `Tahun :  ${bookObject.year}`
  yearBook.setAttribute('data-testid', 'bookItemYear')
  itemBook.appendChild(yearBook)


  const trashButton = document.createElement('button');
  trashButton.textContent = 'Hapus '
  trashButton.classList.add('trash-button');
  trashButton.setAttribute('data-testid', 'bookItemDeleteButton')
  trashButton.addEventListener('click', function () {
    removeBook(bookObject.id)
  })
  itemBook.append(trashButton)



  document.addEventListener('click', function (event) {
    if (event.target.dataset.testid === 'bookItemDeleteButton') {
      const bookId = event.target.closest('[data-bookid]').dataset.bookid;
      removeBook(Number(bookId));
    }
  });

  function removeBook(id) {
    const bookIndex = findBookindex(id);
    if (bookIndex === -1) return

    books.splice(bookIndex, 1)
    document.dispatchEvent(new Event('render-book'))
    saveBook()
  }

  const editButton = document.createElement('button')
  editButton.textContent = 'edit'
  editButton.classList.add('edit-button')
  editButton.setAttribute('data-testid', 'bookItemEditButton')
  itemBook.append(editButton)


  editButton.addEventListener('click', function () {
    openEditFrom(bookObject)
  })

  function openEditFrom(book) {
    const judulInput = document.getElementById('bookFormTitle');
    const penulisInput = document.getElementById('bookFormAuthor');
    const tahunInput = document.getElementById('bookFormYear');
    const isCompleteInput = document.getElementById('bookFormIsComplete');

    judulInput.value = book.title;
    penulisInput.value = book.author;
    tahunInput.value = book.year;
    isCompleteInput.checked = book.isComplete;

    judulInput.dataset.editingId = book.id
  }


  const moveButton = document.createElement('button');
  moveButton.textContent = bookObject.isComplete ? 'pindahkan ke belum selesai' : 'pindahkan ke selesai'
  moveButton.classList.add('move-button');
  moveButton.setAttribute('data-testid', 'bookItemIsCompleteButton')
  itemBook.append(moveButton);

  moveButton.addEventListener('click', function () {
    toggleBookStatus(bookObject.id)
  })

  document.addEventListener('click', function (event) {
    if (event.target.dataset.testid === 'bookItemIsCompleteButton') {
      const bookId = event.target.closest('[data-bookid]').dataset.bookid;
      toggleBookStatus(Number(bookId));
    }
  })

  function toggleBookStatus(bookId) {
    const book = findBook(bookId);
    if (!book) return
    book.isComplete = !book.isComplete;
    document.dispatchEvent(new Event('render-book'));
    saveBook();
  }
  return itemBook;

}

function findBook(id) {
  for (const bookItem of books) {
    if (bookItem.id === id) {
      return bookItem;
    }
  }
  return null;
}

function findBookindex(id) {
  for (let i = 0; i < books.length; i++) {
    if (books[i].id === id) {
      return i;
    }
  }
  return -1
}

function saveBook() {
  if (isStorageExist()) {
    const parsed = JSON.stringify(books);
    localStorage.setItem(STORAGE_KEY, parsed)
  }

}

function bookFromStorage() {
  const serializeData = localStorage.getItem(STORAGE_KEY);
  if (serializeData !== null) {
    const data = JSON.parse(serializeData);

    for (const book of data) {
      books.push(book)
    }
  }

  document.dispatchEvent(new Event(RENDER_EVENT))
}
function isStorageExist() {
  if (typeof Storage === 'undefined') {
    alert('Browser Anda tidak mendukung local storage');
    return false;
  }
  return true;
}

const searchButton = document.getElementById('searchSubmit')

searchButton.addEventListener('click', function (event) {
  event.preventDefault();
  const inputSearch = document.getElementById('searchBookTitle').value

  const inputTitle = inputSearch.toLowerCase();

  const searchResult = books.filter(book => {
    return book.title.toLowerCase().includes(inputTitle)
  })

  displaySearchResult(searchResult)
  console.log(searchResult)


})

function displaySearchResult(result) {
  const uncompleted = document.getElementById('incompleteBookList')
  const completed = document.getElementById('completeBookList')

  completed.innerHTML = '';
  uncompleted.innerHTML = '';

  for (const bookItem of result) {
    const bookElement = elementBook(bookItem);
    if (!bookElement.isComplete) {
      uncompleted.append(bookElement)
    } else {
      completed.append(bookElement)
    }
  }
  saveBook()

}
