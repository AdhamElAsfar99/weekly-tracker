let users = JSON.parse(localStorage.getItem("users")) || [];

function save() {
  localStorage.setItem("users", JSON.stringify(users));
}

function addUser() {
  const input = document.getElementById("nameInput");
  const name = input.value.trim();

  if (!name) return;

  users.push({
    name: name,
    days: [false, false, false, false, false, false, false]
  });

  input.value = "";
  save();
  render();
}

function toggle(userIndex, dayIndex) {
  users[userIndex].days[dayIndex] = !users[userIndex].days[dayIndex];
  save();
}

function deleteUser(index) {
  if (!confirm("هل أنت متأكد من الحذف؟")) return;

  users.splice(index, 1);
  save();
  render();
}

function resetChecks() {
  if (!confirm("إعادة تعيين كل القيم؟")) return;

  users.forEach(user => {
    user.days = user.days.map(() => false);
  });

  save();
  render();
}

function editName(index) {
  const newName = prompt("تعديل الاسم:", users[index].name);

  if (newName && newName.trim() !== "") {
    users[index].name = newName.trim();
    save();
    render();
  }
}

async function shareTable() {
  const table = document.getElementById('tracker');
  const screenshotTitle = document.getElementById('screenshotTitle');
  const deleteColumn = table.querySelectorAll('th:last-child, td:last-child');

  if (!screenshotTitle) return;
  
  // Hide delete column before capture.
  deleteColumn.forEach(el => el.style.display = 'none');
  
  try {
    const tableCanvas = await html2canvas(table, { backgroundColor: '#ffffff' });

    // Build a final image with a title area above the table canvas.
    const titleText = screenshotTitle.textContent.trim() || 'جدول المتابعة الأسبوعي';
    const titleHeight = 56;
    const finalCanvas = document.createElement('canvas');
    finalCanvas.width = tableCanvas.width;
    finalCanvas.height = tableCanvas.height + titleHeight;

    const ctx = finalCanvas.getContext('2d');
    if (!ctx) {
      alert('تعذر إنشاء الصورة');
      return;
    }

    ctx.fillStyle = '#ffffff';
    ctx.fillRect(0, 0, finalCanvas.width, finalCanvas.height);
    ctx.fillStyle = '#333333';
    ctx.font = 'bold 24px Arial';
    ctx.textAlign = 'center';
    ctx.direction = 'rtl';
    ctx.fillText(titleText, finalCanvas.width / 2, 36);
    ctx.drawImage(tableCanvas, 0, titleHeight);

    const blob = await new Promise(resolve => {
      finalCanvas.toBlob(resolve, 'image/png');
    });

    if (!blob) {
      alert('تعذر إنشاء الصورة');
      return;
    }

    if (!navigator.share || !navigator.canShare) {
      alert('ميزة المشاركة غير متاحة على هذا الجهاز');
      return;
    }

    const file = new File([blob], 'tracker.png', { type: 'image/png' });

    if (!navigator.canShare({ files: [file] })) {
      alert('المشاركة بالملفات غير مدعومة على هذا الجهاز');
      return;
    }

    await navigator.share({
      files: [file],
      title: 'جدول المتابعة الأسبوعي'
    });
  } catch (error) {
    console.error('خطأ:', error);
  } finally {
    deleteColumn.forEach(el => el.style.display = '');
  }
}

function render() {
  const tbody = document.querySelector("#tracker tbody");
  tbody.innerHTML = "";

  users.forEach((user, i) => {
    let row = "<tr>";

    // Name (click to edit)
    row += `<td onclick="editName(${i})">${user.name}</td>`;

    // Days
    user.days.forEach((checked, j) => {
      row += `
        <td>
          <input type="checkbox"
            ${checked ? "checked" : ""}
            onchange="toggle(${i}, ${j})">
        </td>
      `;
    });

    // Delete button
    row += `
      <td>
        <button class="delete" onclick="deleteUser(${i})">✖</button>
      </td>
    `;

    row += "</tr>";

    tbody.innerHTML += row;
  });
}

render();
