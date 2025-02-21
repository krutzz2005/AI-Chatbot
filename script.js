let prompt = document.querySelector("#prompt");
let chatcontainer = document.querySelector(".chat-container");
let imagebtn = document.querySelector("#image");
let imageinput = document.querySelector("#image input");

const api_url =
  "https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=AIzaSyCdQaYq_Sfhoo_x0LeCAu1kHBkYEnagrCY";

let user = {
  message: null,
  file: {
    mime_type: null,
    data: null,
  },
};

async function generateresponse(aichatbox) {
  let text = aichatbox.querySelector(".ai-chat-area");

  let requestBody = {
    contents: [
      {
        parts: [{ text: user.message }],
      },
    ],
  };

  // If an image is uploaded, include it in the request
  if (user.file.data) {
    requestBody.contents[0].parts.push({
      inline_data: {
        mime_type: user.file.mime_type,
        data: user.file.data,
      },
    });
  }

  let requestOptions = {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(requestBody),
  };

  try {
    let response = await fetch(api_url, requestOptions);
    let data = await response.json();

    let apiresponse =
      data.candidates[0].content.parts[0].text.replace(/\*\*(.*?)\*\*/g, "$1").trim();

    text.innerHTML = apiresponse;
  } catch (error) {
    console.error("Error:", error);
    text.innerHTML = "Error fetching response.";
  } finally {
    chatcontainer.scrollTo({ top: chatcontainer.scrollHeight, behavior: "smooth" });
  }
}

function createchatbox(html, classes) {
  let div = document.createElement("div");
  div.innerHTML = html;
  div.classList.add(classes);
  return div;
}

function handlechatresponse(usermessage) {
  if (!usermessage.trim() && !user.file.data) return; // Prevent empty messages

  user.message = usermessage;

  let userImageHtml = user.file.data
    ? `<img src="data:${user.file.mime_type};base64,${user.file.data}" class="chooseimg" />`
    : "";

  let html = `<img src="user1.png" alt="" id="userimage" width="50">
    <div class="user-chat-area">
    ${user.message} ${userImageHtml}
    </div>`;

  let userchatbox = createchatbox(html, "user-chat-box");
  chatcontainer.appendChild(userchatbox);
  chatcontainer.scrollTo({ top: chatcontainer.scrollHeight, behavior: "smooth" });

  prompt.value = ""; // Clear input after sending

  setTimeout(() => {
    let html = `<img src="ai.png" alt="" id="aiimage" width="70">
      <div class="ai-chat-area">
      <img src="load.webp" alt="" class="load" width="50px">
      </div>`;
    let aichatbox = createchatbox(html, "ai-chat-box");
    chatcontainer.appendChild(aichatbox);
    generateresponse(aichatbox);
  }, 600);
}

prompt.addEventListener("keydown", (e) => {
  if (e.key === "Enter") {
    handlechatresponse(prompt.value);
  }
});

imageinput.addEventListener("change", () => {
  const file = imageinput.files[0];
  if (!file) return;

  let reader = new FileReader();
  reader.onload = (e) => {
    let base64string = e.target.result.split(",")[1];
    user.file = {
      mime_type: file.type,
      data: base64string,
    };
  };
  reader.readAsDataURL(file);
});

imagebtn.addEventListener("click", () => {
  imageinput.click();
});
