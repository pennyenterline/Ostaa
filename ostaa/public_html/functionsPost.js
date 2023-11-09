// Author: Penny Enterline
// JS for post.html

// adds a new item to the db
newItem.addEventListener("click", () => {

    let t = document.getElementById("title")
    let d = document.getElementById("desc")
    let i = document.getElementById("img")
    let p = document.getElementById("price")
    let s = document.getElementById("stat")

    var obj = {
        title: t.value,
        description: d.value,
        image: i.value,
        price: p.value,
        stat: s.value
    };

    let username = document.cookie.split('username=')[1];

    fetch(`/add/item/${username}`, {
        method: 'POST',
        headers: {
            "Content-type": "application/json"
        },
        body: JSON.stringify(obj)
    });

    sendItem();

    window.location.href = "../home.html"

});

// clears item text boxes
function sendItem() {

    document.getElementById("title").value = '';
    document.getElementById("desc").value = '';
    document.getElementById("img").value = '';
    document.getElementById("price").value = '';
    document.getElementById("stat").value = '';


}