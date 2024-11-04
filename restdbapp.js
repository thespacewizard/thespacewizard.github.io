const API_KEY = "6728feb7075d22cc3577bdea";  // Buraya kendi API anahtarınızı ekleyin
const DATABASE_URL = "https://schatroom-2e7a.restdb.io/rest/chatroom"; // Veritabanı URL'nizi güncelleyin

// Mesajları çekme fonksiyonu
async function getMessages() {
    const response = await fetch(DATABASE_URL, {
        method: "GET",
        headers: {
            "Content-Type": "application/json",
            "x-apikey": API_KEY
        }
    });
    const data = await response.json();
    displayMessages(data);
}

// Mesajları sayfaya yazdırma
function displayMessages(messages) {
    const messagesDiv = document.getElementById("messagebox");
    messagesDiv.innerHTML = "";
    messages.forEach(message => {
        const messageElement = document.createElement("div");
        messageElement.textContent = `${message.username}: ${message.messagecontent}  (Message Date: ${message.messagedate})`;
        messagesDiv.appendChild(messageElement);
    });
}

// Mesaj gönderme fonksiyonu
async function sendMessage() {
    const username = document.getElementById("username").value;
    const content = document.getElementById("content").value;

    if (username && content) {
        const response = await fetch(DATABASE_URL, {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
                "x-apikey": API_KEY
            },
            body: JSON.stringify({
                username: username,
                messagecontent: content,
                messagedate: new Date().toISOString()
            })
        });
        if (response.ok) {
            getMessages();  // Yeni mesaj gönderildikten sonra güncelleme
            document.getElementById("content").value = ""; // Mesaj kutusunu temizle
        } else {
            console.error("Mesaj gönderilemedi.");
        }
    } else {
        alert("Lütfen kullanıcı adı ve mesaj girin.");
    }
}

// Sayfa yüklendiğinde mesajları çek
getMessages();
// setInterval(getMessages, 1000);  // saniyede bir mesajları güncelle
