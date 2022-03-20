// idCount

// users=[{
// userId
// userName
// password
// }]

// posts=[
//     {
//         postId
//         userId
//         content
//     }
// ]
const modal = {
  hide() {
    document.querySelector(".modal").classList.remove("active");
  },
  show() {
    document.querySelector(".modal").classList.add("active");
  },
  init() {
    document.querySelector(".modal").addEventListener("click", (e) => {
      e.target.classList.contains("modal") && this.hide();
    });
  },
};
modal.init();
function readStorage(key) {
  return JSON.parse(localStorage.getItem(key));
}
function writeStorage(key, value) {
  localStorage.setItem(key, JSON.stringify(value));
}
// Dark light
(function () {
  let currentTheme = readStorage("theme") || writeStorage("theme", "l") || "l";
  const lBtn = document.querySelector("#light");
  const dBtn = document.querySelector("#dark");
  const floating = document.querySelector(".floating");
  const x = [1, 2, 3, 4, 5, 6, 7, 8, 9, 10];
  onClick(currentTheme, true);

  lBtn.addEventListener("click", () => onClick("l"));
  dBtn.addEventListener("click", () => onClick("d"));

  function onClick(type, force) {
    // type= 'd'|'l'
    if ((force && type === "l") || (type === "l" && currentTheme !== "l")) {
      currentTheme = "l";
      writeStorage("theme", "l");
      floating.classList.remove("r");

      document.querySelector("#themeStyle")?.remove();

      const style = document.createElement("style");
      style.id = "themeStyle";

      style.innerHTML = `
      :root {
          ${x
            .map((r) => {
              return `--color-${r}: var(--l-color-${r});`;
            })
            .join(" ")}
      }`;
      document.head.appendChild(style);
    } else if ((force && type === "d") || (type === "d" && currentTheme !== "d")) {
      currentTheme = "d";
      writeStorage("theme", "d");
      floating.classList.add("r");

      document.querySelector("#themeStyle")?.remove();

      const style = document.createElement("style");
      style.id = "themeStyle";

      style.innerHTML = `
      :root {
        ${x
          .map((r) => {
            return `--color-${r}: var(--d-color-${r});`;
          })
          .join(" ")}
      }`;
      document.head.appendChild(style);
    }
  }
})();
// Make fake user
(function () {
  //   writeStorage("currentUser", { userName: "Quan", userId: 1 });
  //   writeStorage("currentUser", { userName: "Long", userId: 2 });
  //   writeStorage("users", [
  //     { userName: "Quan", userId: 1, password: "123" },
  //     { userName: "Long", userId: 2, password: "123" },
  //   ]);
})();
// Post status
(function () {
  const wUThink = document.querySelector(".whatUThink");
  const newPost = document.querySelector(".new-post");
  const textArea = newPost.querySelector("textarea");
  const postBtn = newPost.querySelector(".btn");
  const allPost = document.querySelector(".allPost");
  let users = readStorage("users") || writeStorage("users", []) || [];
  let allPostData = readStorage("posts") || writeStorage("posts", []) || [];
  let allPostCount = readStorage("postIdCount") || writeStorage("postIdCount", 1) || 1;
  let allowPost = false;

  const btn = {
    allow() {
      allowPost = true;
      postBtn.removeAttribute("disable");
      postBtn.classList.add("active");
    },
    notAllow() {
      allowPost = false;
      postBtn.setAttribute("disable", "true");
      postBtn.classList.remove("active");
    },
  };

  textArea.addEventListener("input", (e) => {
    console.log(e.target.value);
    e.target.value ? btn.allow() : btn.notAllow();
  });

  postBtn.addEventListener("click", () => {
    allowPost && postNewPost(textArea.value);
  });

  document.querySelector(".modal .close").addEventListener("click", modal.hide);
  wUThink.addEventListener("click", () => {
    modal.show();
    textArea.focus();
  });

  function getDateFormatted() {
    const date = new Date();
    const day = date.getDate();
    const month = date.getMonth() + 1;
    return `${day < 10 ? "0" : ""}${day}/${month < 10 ? "0" : ""}${month}`;
  }
  function deletePost(postId) {
    console.log("delete ", postId);
    allPostData = allPostData.reduce((total, current) => {
      return current.postId === postId ? total : [...total, current];
    }, []);
    writeStorage("posts", allPostData);
    renderOnStart();
  }
  function generate(userName, value, date, postId, forceDelete) {
    const userId = readStorage("currentUser").userId;
    const isExistPost = allPostData.find((r) => r.postId === postId);
    const isLiked = isExistPost && isExistPost.likedUserId.find((r) => r === userId);
    const div = document.createElement("div");
    const deleteBtn = forceDelete || allPostData.find((r) => r.postId === postId && r.userId === userId) ? document.createElement("div") : "";
    if (deleteBtn) {
      deleteBtn.classList = "deletePost cursor-pointer icon flex items-center justify-center";
      deleteBtn.innerHTML = `<i class="fa-solid fa-trash"></i>`;
    }

    div.className = "card post relative";
    div.innerHTML = `
    <div class="flex info justify-between">
    <div class="flex">
        <div class="user-avatar relative round border aspect-square shrink-0 flex items-center justify-center">
        <i class="fa-solid fa-user"></i>
        </div>
        <div class="">
        <h2 class="">${userName}</h2>
        <h3 class="">${date} <i class="fa-solid fa-earth-africa"></i></h3>
        </div>
    </div>
    ${deleteBtn?.outerHTML ?? ""}
    </div>
    <div class="content">
    ${value}
    </div>
    <div class="react user-avatar absolute round border aspect-square shrink-0 flex items-center justify-center">
    <i class="${isLiked ? "active" : ""} fa-solid fa-heart"></i>
    </div>
      `;
    div.querySelector(".deletePost")?.addEventListener("click", () => deletePost(postId));
    div.querySelector(".react").addEventListener("click", (e) => {
      e.target.classList.toggle("active");
      react(postId, userId);
    });
    return div;
  }
  function render(parent, child) {
    parent.prepend(child);
  }
  function react(postId, userId) {
    const existPost = allPostData.find((r) => r.postId === postId);
    console.log({ existPost, allPostData });
    const isLiked = existPost && existPost.likedUserId.find((r) => r === userId);
    isLiked ? removeLike(existPost, postId, userId) : addLike(existPost, postId, userId);
  }
  function removeLike(post, postId, userId) {
    post.likedUserId = post.likedUserId.reduce((total, current) => {
      return current === userId ? total : [...total, current];
    }, []);

    allPostData.reduce((total, r) => {
      return r.postId === postId ? [...total, post] : [...total, r];
    }, []);
    writeStorage("posts", allPostData);
  }
  function addLike(post, postId, userId) {
    post.likedUserId.push(userId);

    allPostData.reduce((total, r) => {
      return r.postId === postId ? [...total, post] : [...total, r];
    }, []);
    writeStorage("posts", allPostData);
  }
  function renderOnStart() {
    allPost.innerHTML = "";
    allPostData.forEach((r) => {
      render(allPost, generate(users.find((rr) => rr.userId === r.userId).userName, r.value, r.date, r.postId, false));
    });
  }
  renderOnStart();

  function postNewPost(value) {
    const date = getDateFormatted();
    const userId = readStorage("currentUser").userId;
    const postId = allPostCount++;

    allPostData = [...allPostData, { date, userId, value, postId, likedUserId: [] }];
    writeStorage("posts", allPostData);
    writeStorage("postIdCount", allPostCount);

    render(allPost, generate(readStorage("currentUser").userName, value, date, postId, true));

    textArea.value = "";
    modal.hide();
  }
})();

// signOut
(function () {
  const signOutBtn = document.querySelector(".signOut");
  signOutBtn.addEventListener("click", () => {
    console.log("click");
    writeStorage("currentUser", {});
    window.location.href = "/";
  });
})();
