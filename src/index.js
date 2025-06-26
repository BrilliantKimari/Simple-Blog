const URL = "http://localhost:3000/posts";

// Initialize the app when DOM is loaded
document.addEventListener("DOMContentLoaded", () => {
  displayPosts();
  document.getElementById("new-post-form").addEventListener("submit", addPost);
});

// Display all posts
function displayPosts() {
  fetch(URL)
    .then(res => {
      if (!res.ok) throw new Error('Network response was not ok');
      return res.json();
    })
    .then(posts => {
      const list = document.getElementById("post-list");
      list.innerHTML = "";

      posts.forEach(post => {
        const div = document.createElement("div");
        div.className = "post-item";
        div.innerHTML = `
          <h3 data-id="${post.id}">${post.title}</h3>
          <p>By ${post.author}</p>
          ${post.image ? `<img src="${post.image}" alt="${post.title}" />` : ''}
        `;
        div.addEventListener("click", () => showPost(post.id));
        list.appendChild(div);
      });

      if (posts.length) showPost(posts[0].id);
    })
    .catch(err => {
      console.error("Failed to load posts:", err);
      document.getElementById("post-list").innerHTML =
        `<p class="error">Error loading posts. Please check if the server is running.</p>`;
    });
}

// Show single post details
function showPost(id) {
  fetch(`${URL}/${id}`)
    .then(res => {
      if (!res.ok) throw new Error('Failed to fetch post details');
      return res.json();
    })
    .then(post => {
      const detailSection = document.getElementById("post-detail");
      detailSection.innerHTML = `
        <h2>${post.title}</h2>
        <p><strong>Author:</strong> ${post.author}</p>
        ${post.image ? `<img src="${post.image}" alt="${post.title}" />` : ''}
        <p>${post.content}</p>
        <div class="post-actions">
          <button class="edit-btn" data-id="${post.id}">Edit</button>
          <button class="delete-btn" data-id="${post.id}">Delete</button>
        </div>
        <div id="edit-form-container"></div>
      `;

      // Add event listeners for buttons
      detailSection.querySelector('.edit-btn').addEventListener('click', () =>
        editForm(post.id, post.title, post.content));
      detailSection.querySelector('.delete-btn').addEventListener('click', () =>
        deletePost(post.id));
    })
    .catch(err => {
      console.error("Failed to load post details:", err);
      document.getElementById("post-detail").innerHTML =
        `<p class="error">Error loading post details.</p>`;
    });
}

// Add new post
function addPost(e) {
  e.preventDefault();
  const form = e.target;

  const newPost = {
    title: form.title.value,
    author: form.author.value,
    content: form.content.value,
    image: form.image.value || "https://via.placeholder.com/150"
  };

  fetch(URL, {
    method: "POST",
    headers: {
      "Content-Type": "application/json"
    },
    body: JSON.stringify(newPost)
  })
  .then(res => {
    if (!res.ok) throw new Error('Failed to create post');
    form.reset();
    displayPosts();
  })
  .catch(err => {
    console.error("Error creating post:", err);
    alert("Failed to create post. Please try again.");
  });
}

// Delete a post
function deletePost(id) {
  if (!confirm("Are you sure you want to delete this post?")) return;

  fetch(`${URL}/${id}`, {
    method: "DELETE"
  })
  .then(res => {
    if (!res.ok) throw new Error('Failed to delete post');
    displayPosts();
  })
  .catch(err => {
    console.error("Error deleting post:", err);
    alert("Failed to delete post. Please try again.");
  });
}

// Show edit form
function editForm(id, title, content) {
  const container = document.getElementById("edit-form-container");
  container.innerHTML = `
    <form id="edit-post-form">
      <input name="title" value="${escapeHtml(title)}" required />
      <textarea name="content" required>${escapeHtml(content)}</textarea>
      <button type="submit">Save</button>
      <button type="button" id="cancel-edit">Cancel</button>
    </form>
  `;

  const form = container.querySelector("form");
  form.addEventListener("submit", (e) => {
    e.preventDefault();
    const data = {
      title: e.target.title.value,
      content: e.target.content.value
    };

    fetch(`${URL}/${id}`, {
      method: "PATCH",
      headers: {
        "Content-Type": "application/json"
      },
      body: JSON.stringify(data)
    })
    .then(res => {
      if (!res.ok) throw new Error('Failed to update post');
      displayPosts();
    })
    .catch(err => {
      console.error("Error updating post:", err);
      alert("Failed to update post. Please try again.");
    });
  });

  container.querySelector("#cancel-edit").addEventListener("click", () => {
    container.innerHTML = "";
  });
}

// Helper function to escape HTML for safety
function escapeHtml(unsafe) {
  return unsafe
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#039;");
}