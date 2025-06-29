const URL = "http://localhost:3000/posts";

document.addEventListener("DOMContentLoaded", main);

function main() {
  displayPosts();
  addNewPostListener();
}

function displayPosts() {
  fetch(URL)
    .then(r => r.json())
    .then(posts => {
      const list = document.getElementById("post-list");
      list.innerHTML = "";
      if (posts.length === 0) {
        document.getElementById("post-detail").innerHTML = `<p style="color:#888;text-align:center;">No posts available. Add a new post!</p>`;
        return;
      }
      posts.forEach(p => {
        const div = document.createElement("div");
        div.innerHTML = `<h3 tabindex="0" data-id="${p.id}">${p.title}</h3><p>By ${p.author}</p>${p.image ? `<img src="${p.image}" alt="Post image"/>` : ""}`;
        const h3 = div.querySelector("h3");
        h3.onclick = () => showPost(p.id);
        h3.onkeydown = e => { if (e.key === "Enter" || e.key === " ") showPost(p.id); };
        list.appendChild(div);
      });
      showPost(posts[0].id);
    })
    .catch(() => {
      document.getElementById("post-list").innerHTML = `<p style="color:red;">Failed to load posts.</p>`;
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
        ${p.image ? `<img src="${p.image}" alt="Post image" />` : ""}
        <p>${p.content}</p>
        <button onclick="window.editForm(${p.id}, '${escape(p.title)}', \`${escape(p.content)}\`)">Edit</button>
        <button onclick="window.deletePost(${p.id})">Delete</button>
        <div id="edit-form-container"></div>
      `;
    })
    .catch(() => {
      document.getElementById("post-detail").innerHTML = `<p style="color:red;">Failed to load post details.</p>`;
    });
}

function addNewPostListener() {
  document.getElementById("new-post-form").addEventListener("submit", addPost);
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
  })
    .then(() => {
      f.reset();
      displayPosts();
    })
    .catch(() => alert("Failed to add post."));
}

window.deletePost = function(id) {
  if (confirm("Delete this post?")) {
    fetch(`${URL}/${id}`, { method: "DELETE" })
      .then(displayPosts)
      .catch(() => alert("Failed to delete post."));
  }
};

window.editForm = function(id, title, content) {
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
    })
      .then(displayPosts)
      .catch(() => alert("Failed to update post."));
  };
};

// Helper to escape backticks and quotes safely
function escape(str) {
  return str.replace(/\\/g, "\\\\").replace(/`/g, "\\`").replace(/'/g, "\\'");
}
