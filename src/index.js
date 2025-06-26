const URL = "http://localhost:3000/posts";

document.addEventListener("DOMContentLoaded", () => {
  displayPosts();
  document.getElementById("new-post-form").addEventListener("submit", addPost);
});

function displayPosts() {
  fetch(URL)
    .then(r => r.json())
    .then(posts => {
      const list = document.getElementById("post-list");
      list.innerHTML = "";
      posts.forEach(p => {
        const div = document.createElement("div");
        div.innerHTML = `<h3 data-id="${p.id}">${p.title}</h3><p>By ${p.author}</p>${p.image ? `<img src="${p.image}"/>` : ""}`;
        div.querySelector("h3").onclick = () => showPost(p.id);
        list.appendChild(div);
      });
      if (posts.length) showPost(posts[0].id);
    });
}

function showPost(id) {
  fetch(`${URL}/${id}`)
    .then(r => r.json())
    .then(p => {
      const d = document.getElementById("post-detail");
      d.innerHTML = `
        <h2>${p.title}</h2>
        <p><strong>Author:</strong> ${p.author}</p>
        ${p.image ? `<img src="${p.image}" />` : ""}
        <p>${p.content}</p>
        <button onclick="editForm(${p.id}, '${escape(p.title)}', \`${escape(p.content)}\`)">Edit</button>
        <button onclick="deletePost(${p.id})">Delete</button>
        <div id="edit-form-container"></div>
      `;
    });
}

function addPost(e) {
  e.preventDefault();
  const f = e.target;
  const post = {
    title: f.title.value,
    author: f.author.value,
    content: f.content.value,
    image: f.image.value || "https://via.placeholder.com/150"
  };
  fetch(URL, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(post)
  }).then(() => {
    f.reset();
    displayPosts();
  });
}

function deletePost(id) {
  if (confirm("Delete this post?")) {
    fetch(`${URL}/${id}`, { method: "DELETE" }).then(displayPosts);
  }
}

function editForm(id, title, content) {
  const c = document.getElementById("edit-form-container");
  c.innerHTML = `
    <form id="edit-post-form">
      <input name="title" value="${unescape(title)}" required />
      <textarea name="content" required>${unescape(content)}</textarea>
      <button type="submit">Save</button>
      <button type="button" onclick="document.getElementById('edit-form-container').innerHTML = ''">Cancel</button>
    </form>
  `;
  c.querySelector("form").onsubmit = e => {
    e.preventDefault();
    const data = {
      title: e.target.title.value,
      content: e.target.content.value
    };
    fetch(`${URL}/${id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(data)
    }).then(displayPosts);
  };
}

// Helper to escape backticks and quotes safely
function escape(str) {
  return str.replace(/\\/g, "\\\\").replace(/`/g, "\\`").replace(/'/g, "\\'");
}
