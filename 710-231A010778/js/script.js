document.addEventListener('DOMContentLoaded', () => {
    // Kích hoạt các chức năng tương ứng nếu element tồn tại
    if (document.getElementById('carousel-slide')) {
        setupCarousel();
    }
    if (document.getElementById('todo-form')) {
        setupTodoApp();
    }
    if (document.getElementById('guess-form')) {
        setupGuessingGame();
    }
});


/* -------------------------------------------------------------------------- */
/* BÀI 1: CAROUSEL                           */
/* -------------------------------------------------------------------------- */

function setupCarousel() {
    const slideContainer = document.getElementById('carousel-slide');
    const prevBtn = document.getElementById('prevBtn');
    const nextBtn = document.getElementById('nextBtn');
    
    // Giả sử mỗi ảnh trong HTML là một slide
    const slides = slideContainer.querySelectorAll('img');
    const totalSlides = slides.length; 
    let currentIndex = 0; // Bắt đầu từ slide đầu tiên
    let intervalId;

    if (totalSlides === 0) return;

    // Hàm cập nhật vị trí slide
    const updateSlide = () => {
        // Dùng CSS transform để chuyển động. 
        // Vị trí: -(currentIndex * 100%)
        slideContainer.style.transform = `translateX(-${currentIndex * 100}%)`;
    };

    // Hàm chuyển slide tiếp theo
    const nextSlide = () => {
        // **Logic xử lý index tránh out-of-bound:**
        // Nếu là slide cuối (totalSlides - 1), chuyển về 0 (slide đầu tiên).
        // Ngược lại, tăng index lên 1.
        currentIndex = (currentIndex + 1) % totalSlides;
        updateSlide();
    };

    // Hàm chuyển slide trước đó
    const prevSlide = () => {
        // **Logic xử lý index tránh out-of-bound:**
        // Nếu là slide đầu (0), chuyển về slide cuối (totalSlides - 1).
        // Ngược lại, giảm index đi 1.
        currentIndex = (currentIndex - 1 + totalSlides) % totalSlides;
        updateSlide();
    };

    // Tự động chuyển slide sau 3 giây
    const startAutoSlide = () => {
        // Xóa interval cũ trước khi tạo mới để tránh lỗi lặp
        clearInterval(intervalId); 
        intervalId = setInterval(nextSlide, 3000);
    };

    // Xử lý sự kiện nút
    nextBtn.addEventListener('click', () => {
        nextSlide();
        startAutoSlide(); // Reset thời gian tự động chuyển khi người dùng thao tác
    });

    prevBtn.addEventListener('click', () => {
        prevSlide();
        startAutoSlide(); // Reset thời gian tự động chuyển khi người dùng thao tác
    });

    // Bắt đầu tự động chạy lần đầu
    startAutoSlide();
}


/* -------------------------------------------------------------------------- */
/* BÀI 2: TODO LIST                          */
/* -------------------------------------------------------------------------- */

// State (trạng thái) của ứng dụng, được đồng bộ với LocalStorage
let todos = JSON.parse(localStorage.getItem('todos')) || []; 

function saveTodos() {
    localStorage.setItem('todos', JSON.stringify(todos));
}

function renderTodos() {
    const todoList = document.getElementById('todo-list');
    if (!todoList) return;

    // **Logic tư duy: Render lại DOM hiệu quả**
    // 1. Dùng .innerHTML = '' để xóa toàn bộ, sau đó render lại. 
    //    (Đơn giản, dễ implement, performance chấp nhận được với danh sách nhỏ).
    // 2. Dùng DocumentFragment hoặc so sánh DOM (virtual DOM) (Phức tạp hơn, tốt hơn cho danh sách rất lớn).
    // => Ở đây chọn phương án 1 cho sự đơn giản và phù hợp với yêu cầu cơ bản.
    todoList.innerHTML = ''; 

    todos.forEach((todo, index) => {
        const listItem = document.createElement('li');
        listItem.classList.add('todo-item');
        listItem.dataset.index = index; // Dùng data-index để xác định task

        // Nếu task đang ở chế độ chỉnh sửa
        if (todo.editing) {
            listItem.classList.add('editing');
        }

        listItem.innerHTML = `
            <span class="task-text">${todo.text}</span>
            <input type="text" class="task-edit-input" value="${todo.text}">
            <button class="edit-btn" onclick="toggleEdit(${index})">Sửa</button>
            <button class="save-btn" onclick="saveEdit(${index})">Lưu</button>
            <button class="delete-btn" onclick="deleteTodo(${index})">Xóa</button>
        `;
        todoList.appendChild(listItem);
    });
}

function addTodo() {
    const input = document.getElementById('todo-input');
    const text = input.value.trim();

    if (text) {
        // **Logic xử lý mảng state:**
        // Thêm đối tượng mới vào mảng `todos` (state)
        todos.push({ text: text, editing: false });
        input.value = '';
        saveTodos();  // Lưu state mới
        renderTodos(); // Render lại DOM
    }
}

function deleteTodo(index) {
    // **Logic xử lý mảng state:**
    // Dùng splice để xóa phần tử tại index khỏi mảng `todos`
    todos.splice(index, 1);
    saveTodos();
    renderTodos();
}

function toggleEdit(index) {
    // **Logic xử lý mảng state:**
    // Cập nhật thuộc tính 'editing' của đối tượng task
    todos[index].editing = true;
    renderTodos();
}

function saveEdit(index) {
    const listItem = document.querySelector(`.todo-item[data-index="${index}"]`);
    const newText = listItem.querySelector('.task-edit-input').value.trim();

    if (newText) {
        // **Logic xử lý mảng state:**
        todos[index].text = newText;
        todos[index].editing = false;
        saveTodos();
        renderTodos();
    }
}


function setupTodoApp() {
    // Gán hàm addTodo cho nút Thêm Task và sự kiện Enter trong input
    document.getElementById('todo-form').addEventListener('submit', (e) => {
        e.preventDefault();
        addTodo();
    });

    // Lần đầu tiên tải trang, render dữ liệu từ LocalStorage
    renderTodos();
}


/* -------------------------------------------------------------------------- */
/* BÀI 3: GUESSING GAME                      */
/* -------------------------------------------------------------------------- */

let targetNumber;
let attempts = 0;

function generateTargetNumber() {
    // **Logic tư duy: Cách generate random**
    // Math.random(): Trả về số thực [0, 1)
    // Math.random() * 100: Trả về số thực [0, 100)
    // Math.floor(Math.random() * 100): Trả về số nguyên [0, 99]
    // Math.floor(Math.random() * 100) + 1: Trả về số nguyên **[1, 100]**
    targetNumber = Math.floor(Math.random() * 100) + 1;
    attempts = 0;
    console.log("Số bí mật (chỉ để debug):", targetNumber);
}

function checkGuess() {
    const inputElement = document.getElementById('guess-input');
    const messageElement = document.getElementById('message');
    const attemptsElement = document.getElementById('attempts');
    
    // **Logic tư duy: Xử lý input để tránh lỗi**
    const guess = parseInt(inputElement.value);

    // Kiểm tra tính hợp lệ của input
    if (isNaN(guess) || guess < 1 || guess > 100) {
        messageElement.textContent = "Vui lòng nhập một số từ 1 đến 100 hợp lệ.";
        inputElement.value = '';
        return;
    }

    attempts++;
    attemptsElement.textContent = `Số lần thử: ${attempts}`;

    if (guess < targetNumber) {
        messageElement.textContent = "Quá thấp! Hãy thử lại.";
        messageElement.style.color = '#dc3545';
    } else if (guess > targetNumber) {
        messageElement.textContent = "Quá cao! Hãy thử lại.";
        messageElement.style.color = '#dc3545';
    } else {
        messageElement.textContent = `CHÍNH XÁC! Bạn đã đoán đúng số ${targetNumber} sau ${attempts} lần thử! 🎉`;
        messageElement.style.color = '#28a745';
        
        // Hiển thị Confetti
        showConfetti(); 

        // Tắt input và nút đoán
        inputElement.disabled = true;
        document.getElementById('guess-btn').disabled = true;
    }

    inputElement.value = '';
    inputElement.focus();
}

function resetGame() {
    generateTargetNumber();
    document.getElementById('message').textContent = "Bắt đầu đoán số!";
    document.getElementById('message').style.color = '#333';
    document.getElementById('attempts').textContent = `Số lần thử: 0`;
    document.getElementById('guess-input').value = '';
    document.getElementById('guess-input').disabled = false;
    document.getElementById('guess-btn').disabled = false;
    document.querySelector('.confetti-container')?.remove(); // Xóa confetti cũ
}


function showConfetti() {
    const container = document.createElement('div');
    container.classList.add('confetti-container');
    document.body.appendChild(container);

    for (let i = 0; i < 50; i++) {
        const confetti = document.createElement('div');
        confetti.classList.add('confetti');
        
        // Tạo vị trí và hướng rơi ngẫu nhiên
        const xStart = Math.random() * window.innerWidth;
        const yStart = Math.random() * -100;
        const xEnd = xStart + (Math.random() - 0.5) * 400;
        const yEnd = window.innerHeight + 100;
        const delay = Math.random() * 2;
        
        confetti.style.left = `${xStart}px`;
        confetti.style.top = `${yStart}px`;
        confetti.style.backgroundColor = `hsl(${Math.random() * 360}, 100%, 50%)`;
        confetti.style.animationDelay = `${delay}s`;
        
        // Truyền biến CSS để tạo hiệu ứng rơi khác nhau
        confetti.style.setProperty('--x', '0');
        confetti.style.setProperty('--y', '0');
        confetti.style.setProperty('--x-end', `${xEnd - xStart}px`);
        confetti.style.setProperty('--y-end', `${yEnd - yStart}px`);

        container.appendChild(confetti);
    }
}


function setupGuessingGame() {
    resetGame(); // Khởi tạo số ngẫu nhiên

    document.getElementById('guess-form').addEventListener('submit', (e) => {
        e.preventDefault();
        checkGuess();
    });
    
    document.getElementById('reset-btn').addEventListener('click', resetGame);
}

// Export các hàm cần thiết ra global scope để có thể gọi từ HTML (ví dụ: onclick)
window.toggleEdit = toggleEdit;
window.saveEdit = saveEdit;
window.deleteTodo = deleteTodo;
window.resetGame = resetGame;