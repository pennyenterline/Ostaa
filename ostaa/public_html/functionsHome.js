// Author: Penny Enterline
// JS for home.html

// getting current user based on session
let username = document.cookie.split('username=')[1];
// setting welcome message
if (username) {
    document.getElementById('welcome').innerText = `Welcome ${username}! What would you like to do?`;
} else {
    window.location.href = '/';
}

// loads listings for current user
listings.addEventListener("click", () => {

    let username = document.cookie.split('username=')[1];

    let searchListings = fetch(`/get/listings/${username}`);

    searchListings.then(response => {

        return response.json();

    }).then((items) => {

        let results = '';

        for (let i = 0; i < items.length; i++) {
            let status;

            if (items[i].stat == 'SALE') {
                status = `<button id="buy-btn-search-${i}" onclick='buyItem("${items[i]._id}", "buy-btn-search-${i}")'>Buy now</button>`;
            } else {
                status = '<p>Purchased</p>';
            }
            // changing html to display results
            results += `
          <div class='item'>
            <h4>${items[i].title}</h4>
            <p>${items[i].description}</p>
            <p>Price: ${items[i].price}</p>
            ${status} 
          </div>`;
        }

        document.getElementById('itemResults').innerHTML = results;
        document.getElementById('resultsHeader').textContent = 'Your listings:';

    }).catch(() => {
        console.log('error')
    });
});

// loads purchases made by the user
purchases.addEventListener("click", () => {

    let username = document.cookie.split('username=')[1];

    let searchPurchases = fetch(`/get/purchases/${username}`);

    searchPurchases.then(response => {

        return response.json();

    }).then((items) => {

        let results = '';

        for (let i = 0; i < items.length; i++) {
            let status;

            // changing html to display results
            results += `
            <div class='item'>
              <h4>${items[i].title}</h4>
              <p>${items[i].description}</p>
              <p>Price: ${items[i].price}</p>
            </div>`;
        }

        document.getElementById('itemResults').innerHTML = results;
        document.getElementById('resultsHeader').textContent = 'Your purchases:';

    }).catch(() => {
        console.log('error')
    });
});

// loads search data made by user
searchButton.addEventListener('click', function (e) {
    e.preventDefault();

    let searchVal = document.getElementById("search").value;

    console.log(searchVal);

    if (searchVal) {

        let searchListings = fetch(`/search/items/${searchVal}`);

        searchListings.then(response => {

            return response.json();

        }).then((items) => {

            let results = '';

            for (let i = 0; i < items.length; i++) {
                console.log(items[i]._id)
                let status;

                if (items[i].stat == 'SALE') {
                    status = `<button id="buy-btn-search-${i}" onclick='buyItem("${items[i]._id}", "buy-btn-search-${i}>Buy now</button>`;
                } else {
                    status = '<p>Purchased</p>';
                }
                // changing html to display results
                results += `
                <div class='item'>
                  <h4>${items[i].title}</h4>
                 <p>${items[i].description}</p>
                 <p>Price: ${items[i].price}</p>
                 ${status} 
                </div>`;
            }

            document.getElementById('itemResults').innerHTML = results;
            document.getElementById('resultsHeader').textContent = 'Search results:';

        }).catch(() => {
            console.log('error')
        });
    }
});

// takes user to create post page
create.addEventListener('click', function (e) {
    e.preventDefault();

    window.location.href = "/post.html"

});

// changes data when item is sold
function buyItem(itemId, buttonId) {

    let btn = document.getElementById(buttonId);
    btn.disabled = true;
  
    const info = {
      username: username,
      itemId, itemId
    };
  
    let post = fetch('/buy', {
      method: 'POST',
      body: JSON.stringify(info),
      headers: { 'Content-Type': 'application/json'}
    });
  
    post.then(response => {
      return response.json();
  
    }).then((userObject) => {
      btn.textContent = 'SOLD';
  
    }).catch(() => { 
      alert('error');
    });
  }