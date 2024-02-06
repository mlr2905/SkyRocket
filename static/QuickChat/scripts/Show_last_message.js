async function last_message() {
    const mainPage = { name: document.getElementById('name').value }; // Access name directly
  
    for (let i = 1; i < 5; i++) {
      const url = `/api/chat${i}`;
      try {
        const response = await fetch(url);
        if (!response.ok) throw new Error('network problem');
        const data = await response.json();
        localStorage.setItem(`chat${i}`, JSON.stringify(data));
        const last_m = data;
        const a = last_m.length - 1;
        const div = document.getElementById(`p-${i}`);
        div.innerHTML = "";
        const p_son = document.createElement('p');
        const emsp = document.createElement('p');
        const div2 = document.getElementById(`user-name${i}`);
        div2.innerHTML = "";

        const user_name = last_m[a].user === mainPage.name ? "you" : last_m[a].user;
        const imgMap = { 1: img_user1, 2: img_user2, 3: img_user3, 4: img_user4 };
        imgMap[i].src = user_name === "you" ? mainPage.img_user || "image/man.png" : "image/bot.png";
  
        p_son.innerHTML = `<b>${user_name}</b>: ${last_m[a].type === "text" && last_m[a].text.length > 25 ? "Long message!!" : last_m[a].text || "photo message!!" || "link message!!"}`;
  
        div2.appendChild(p_son);
        div2.appendChild(document.createElement('p')).innerHTML = last_m[a].time;
        div.appendChild(emsp).innerHTML = `.&emsp;&emsp;&emsp;&emsp;&emsp;&emsp;&emsp;&emsp;&emsp;&emsp;&emsp;.`;
        div.appendChild(document.createElement('b')).innerHTML = a;
      } catch (error) {
        console.error('Error fetching or processing data:', error);
      }
    }
  }
  