const API_KEY = "67293c6f075d222ac477bdf0";  // Buraya kendi API anahtarınızı ekleyin
const DATABASE_URL = "https://schatroom-2e7a.restdb.io/rest/chatroom"; // Veritabanı URL'nizi güncelleyin

var db = new restdb(API_KEY, DATABASE_URL);

// Mesajları çekme fonksiyonu
async function getMessages() {
    // const response = await fetch(DATABASE_URL, {
    //     method: "GET",
    //     headers: {
    //         "Content-Type": "application/json",
    //         "x-apikey": API_KEY
    //     },
    // });
    // const data = await response.json();

    var query = {}; // get all records
    var hints = {"$max": Infinity, "$orderby": {"_id": 1}}; // top ten, sort by creation id in descending order
    db.chatroom.find(query, hints, function(err, res){
      if (!err){
        displayMessages(res);
        // console.log(res);
      }
      else
      {
        console.log("Error at getting messages from restdb database.");
      }
    });
}

// Mesajları sayfaya yazdırma
function displayMessages(messages) {
    const messagesDiv = document.getElementById("messagebox");
    messagesDiv.innerHTML = "";
    messages.forEach(message => {
        const messageElement = document.createElement("div");
        messageElement.innerHTML = `<b>${message.username}</b>: ${message.messagecontent}  <i>(Message Date: ${message.messagedate})</i>`;
        messagesDiv.appendChild(messageElement);
    });
}

// Mesaj gönderme fonksiyonu
async function sendMessage() {
    const username = document.getElementById("username").value;
    const content = document.getElementById("content").value;

    if (username && content) {
        
        const now = new Date();
        const formattedDate = `${now.getHours()}:${now.getMinutes()} ${now.getUTCFullYear()}/${now.getUTCMonth()}/${now.getUTCDay()}`;

        var chatroom = new db.chatroom({"username": username, "messagecontent": content, "messagedate": formattedDate});

        chatroom.save(function(err, res){
            if (!err){
                // res is now the saved obj
                getMessages();
                document.getElementById("content").value = ""; // Mesaj kutusunu temizle
            }
            else
            {
                alert("Mesajınız teknik bir sorundan dolayı iletilemedi.");
            }
        });

        // const response = await fetch(DATABASE_URL, {
        //     method: "POST",
        //     headers: {
        //         "Content-Type": "application/json",
        //         "x-apikey": API_KEY
        //     },
        //     body: JSON.stringify({
        //         username: username,
        //         messagecontent: content,
        //         messagedate: new Date().toISOString()
        //     })
        // });
        // if (response.ok) {
        //     getMessages();  // Yeni mesaj gönderildikten sonra güncelleme
        //     document.getElementById("content").value = ""; // Mesaj kutusunu temizle
        // } else {
        //     console.error("Mesaj gönderilemedi.");
        // }




    } else {
        alert("Lütfen kullanıcı adı ve mesaj girin.");
    }
}

// Sayfa yüklendiğinde mesajları çek
getMessages();
setInterval(getMessages, 2000);  // saniyede bir mesajları güncelle
