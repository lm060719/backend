document.addEventListener("DOMContentLoaded", function() {
  const links = document.querySelectorAll("td:first-child a");
  links.forEach(link => {
    // 检查链接文本末尾是否有斜杠来判断是否为文件夹
    if (link.textContent.endsWith('/')) {
      link.dataset.type = 'folder';
    } else {
      link.dataset.type = 'file';
    }
  });
});
