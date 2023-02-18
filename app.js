console.log('The shop and cart!');

const CART = {
  KEY: 'Unique_string_for_the_cart_logic',
  contents: [],
  init() {
   
    // Check localSstorage and initialize the contents of CART.contents
    let _contents = localStorage.getItem(this.KEY);
    if (_contents) {
      CART.contents = JSON.parse(_contents);
    } else {
      // dummy data for testing purposes
      CART.contents = [
        {id: 1, title: 'Apple', qty: 5, itemPrice: 0.85},
        {id: 2, title: 'Banana', qty: 3, itemPrice: 0.35},
        {id: 3, title: 'Cherry', qty: 8, itemPrice: 0.05},
      ];
      CART.sync();
    }
  },
  async sync() {
    let _cart = JSON.stringify(CART.contents);
    await localStorage.setItem(CART.KEY, _cart);
  },
  find(id) {
     //find an item in the cart by it's id
    let match = CART.contents.filter(item => {
      if(item.id == id) {
        return true;
      }
    });
    if (match && match[0])
        return match[0]
  },
  add(id) {
      //add a new item to the cart
      //check that it is not in the cart already
      if (CART.find(id)) {
        CART.increase(id, 1);
      } else {
        let arr = PRODUCTS.filter(product => {
          if (product.id == id) {
            return true;
          }
        });
        if (arr && arr[0]) {
          let obj = {
            id: arr[0].id,
            title: arr[0].title,
            qty: 1,
            itemPrice: arr[0].price
          };
          CART.contents.push(obj);
          // Update localStorage
          CART.sync();
        } else {
          // product id does not exist in products data
          console.error('Invalid Product');
        }
      }
  },
  increase(id, qty = 1) {
    //increase the quantity of an item in the cart
    CART.contents = CART.contents.map(item=>{
      if(item.id === id)
          item.qty = item.qty + qty;
      return item;
  });
    //update localStorage
    CART.sync()
  },
  reduce(id, qty = 1) {
    //reduce the quantity of an item in the cart
    CART.contents = CART.contents.map(item => {
      if ( item.id === id) {
        item.qty = item.qty  - qty;
        return item;
      }
    });
    CART.contents.forEach( async item => {
      if (item.id === id && item.qty === 0 ) {
        await CART.remove(id);
      }
    });
    // Update localStorage
    CART.sync();
  },
  remove(id) {
    //remove an item entirely from CART.contents based on its id
    CART.contents = CART.contents.filter(item => {
      if ( item.id !== id ) {
        return true;
      }
    });
    // Update localStorage
    CART.sync();
  },
  empty(){
    //empty whole cart
    CART.contents = [];
    //update localStorage
    CART.sync()
},
sort(field = 'title') {
  // Sort by field - title, price
  //return a sorted shallow copy of the CART.contents array
  let sorted = CART.contents.sort((a, b) => {
    if ( a[field] > b[field]) {
      return 1;
    }  else  if (a[field] < b[field]) {
      return -1;
    } else { 
      return 0;
    }
  });
  return sorted;
  // No impact on localStorage
},
logContents(prefix) {
  console.log(prefix, CART.contents)
}

};

let PRODUCTS = [];

document.addEventListener('DOMContentLoaded', () => {
  
  //When page has been loaded
  getProducts(showProducts, errorMessage);

  // Get the cart items from localStorage
  CART.init();

  // Load the cart items
  showCart();
});

function showCart() {
  let cartSection = document.getElementById('cart');
  cart.innerHTML = '';
  let s = CART.sort('qty');
  s.forEach((item) => {
    let cartitem = document.createElement('div');
    cartitem.className = 'cart-item';

    let  title = document.createElement('h3');
    title.textContent = item.title;
    title.className = 'title';
    cartitem.appendChild(title);

    let controls = document.createElement('div');
    controls.className = 'controls';
    cartitem.appendChild(controls);
    
    let plus = document.createElement('span');
    plus.textContent = '+';
    plus.setAttribute('data-id', item.id)
    controls.appendChild(plus);
    plus.addEventListener('click', incrementCart)

    let qty = document.createElement('span');
    qty.textContent = item.qty;
    controls.appendChild(qty);
    
    let minus = document.createElement('span');
    minus.textContent = '-';
    minus.setAttribute('data-id', item.id)
    controls.appendChild(minus);
    minus.addEventListener('click', decrementCart)

    let price = document.createElement('div');
    price.className = 'price';
    let cost = new Intl.NumberFormat('nl-NL',
                    {style: 'currency', currency: 'EUR'}
    ).format(item.qty * item.itemPrice) ;
    price.textContent = cost;
    cartitem.appendChild(price);

    cartSection.appendChild(cartitem)
  })
}

function incrementCart(e) {
  e.preventDefault();
  let id = parseInt(e.target.getAttribute('data-id'));
  CART.increase(id, 1);
  let controls = e.target.parentElement;
  let qty = controls.querySelector('span:nth-child(2)');
  let item = CART.find(id);
  if (item) {
    qty.textContent = item.qty;
  } else {
    document.getElementById('cart').removeChild(controls.parentElement);
  }
}

function decrementCart(ev){
  ev.preventDefault();
  let id = parseInt(ev.target.getAttribute('data-id'));
  CART.reduce(id, 1);
  let controls = ev.target.parentElement;
  let qty = controls.querySelector('span:nth-child(2)');
  let item = CART.find(id);
  if(item){
      qty.textContent = item.qty;
  }else{
      document.getElementById('cart').removeChild(controls.parentElement);
  }
}

function getProducts(success, failure) {
   //request the list of products from the "server"
   const URL = 'https://github.com/Fabian295/cart/blob/main/data.json';

   fetch(URL, {
    method: 'GET',
    mode: 'no-cors'
   })
   .then(response => response.json())
   .then(showProducts)
   .catch(err => {
    errorMessage(err.message);
   });
}


function showProducts(products) {

  

  PRODUCTS = products;

  console.log(products)

              //take data.products and display inside <section id="products">
              let imgPath = './images/';
              let productSection = document.getElementById('products');
              productSection.innerHTML = "";
              products.forEach(product=>{
                  let card = document.createElement('div');
                  card.className = 'card';
                  //add the image to the card
                  let img = document.createElement('img');
                  img.alt = product.title;
                  img.src = imgPath + product.img;
                  card.appendChild(img);
                  //add the price
                  let price = document.createElement('p');
                  let cost = new Intl.NumberFormat('nl-NL', 
                                          {style:'currency', currency:'EUR'}).format(product.price);
                  price.textContent = cost;
                  price.className = 'price';
                  card.appendChild(price);
                  
                  //add the title to the card
                  let title = document.createElement('h2');
                  title.textContent = product.title;
                  card.appendChild(title);
                  //add the description to the card
                  let desc = document.createElement('p');
                  desc.textContent = product.desc;
                  card.appendChild(desc);
                  //add the button to the card
                  let btn = document.createElement('button');
                  btn.className = 'btn';
                  btn.textContent = 'Add Item';
                  btn.setAttribute('data-id', product.id);
                  btn.addEventListener('click', addItem);
                  card.appendChild(btn);
                  //add the card to the section
                  productSection.appendChild(card);
              })
}

function addItem(ev){
  ev.preventDefault();
  let id = parseInt(ev.target.getAttribute('data-id'));
  console.log('add to cart item', id);
  CART.add(id, 1);
  showCart();
}

function errorMessage(err){
  //display the error message to the user
  console.log(err);
}