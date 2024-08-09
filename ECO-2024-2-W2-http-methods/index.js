document.getElementById("fetch-button").addEventListener("click", fetchData);
document.getElementById("post-form").addEventListener("submit", createPost);

async function fetchData() {
  renderLoadingState();
  try {
    const [postsResponse, usersResponse] = await Promise.all([
      fetch("http://localhost:3004/posts"),
      fetch("http://localhost:3004/users")
    ]);

    if (!postsResponse.ok || !usersResponse.ok) {
      throw new Error("Network response was not ok");
    }

    const [postsData, usersData] = await Promise.all([
      postsResponse.json(),
      usersResponse.json()
    ]);

    const usersMap = usersData.reduce((map, user) => {
      map[user.id] = user.name;
      return map;
    }, {});

    const postsWithUserNames = postsData.map(post => ({
      ...post,
      userName: usersMap[post.userId]
    }));

    renderData(postsWithUserNames);
  } catch (error) {
    renderErrorState();
  }
}

function renderErrorState() {
  const container = document.getElementById("data-container");
  container.innerHTML = ""; // Clear previous data
  container.innerHTML = "<p>Failed to load data</p>";
  console.log("Failed to load data");
}

function renderLoadingState() {
  const container = document.getElementById("data-container");
  container.innerHTML = ""; // Clear previous data
  container.innerHTML = "<p>Loading...</p>";
  console.log("Loading...");
}

function renderData(data) {
  const container = document.getElementById("data-container");
  container.innerHTML = ""; // Clear previous data

  if (data.length > 0) {
    data.forEach((item) => {
      const div = document.createElement("div");
      div.className = "item";
      div.innerHTML = `<strong>${item.title}</strong> by ${item.userName} <p>${item.body}</p>`;

      const deleteButton = document.createElement("button");
      deleteButton.innerText = "Delete";
      deleteButton.addEventListener("click", () => deletePost(item.id));
      div.appendChild(deleteButton);

      
      container.appendChild(div);
    });
  }
}

async function createPost(event) {
  event.preventDefault();
  const userId = document.getElementById("user-id").value;
  const title = document.getElementById("title").value;
  const body = document.getElementById("body").value;

  try {
    const response = await fetch("http://localhost:3004/posts", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ userId, title, body }),
    });

    if (!response.ok) {
      throw new Error("Failed to create post");
    }

    document.getElementById("post-form").reset();
    fetchData(); // Refresh creation
  } catch (error) {
    console.log("Failed to create post", error);
  }
}

async function deletePost(postId) {
  try {
    const response = await fetch(`http://localhost:3004/posts/${postId}`, {
      method: "DELETE",
    });

    if (!response.ok) {
      throw new Error("Failed to delete post");
    }

    fetchData(); // Refresh deletion
  } catch (error) {
    console.log("Failed to delete post", error);
  }
}
