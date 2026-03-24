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
  const captureArea = document.getElementById('captureArea');
  const screenshotTitle = document.getElementById('screenshotTitle');
  const deleteColumn = table.querySelectorAll('th:last-child, td:last-child');

  if (!captureArea || !screenshotTitle) return;
  
  // Show screenshot title and hide delete column before capture.
  screenshotTitle.style.display = 'block';
  deleteColumn.forEach(el => el.style.display = 'none');
  
  try {
    const canvas = await html2canvas(captureArea);

    const blob = await new Promise(resolve => {
      canvas.toBlob(resolve, 'image/png');
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
    screenshotTitle.style.display = '';
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
