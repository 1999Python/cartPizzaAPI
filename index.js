document.addEventListener("alpine:init", () => {

    Alpine.data('pizzaCart', () => {

        return {

            title: "Pizza Cart API",
            pizzas: [],
            username: '',
            cartID: '',
            cartPizzas: [],
            cartTotal: 0.00,
            paymentAmount: 0,
            message: '',
            login() {
                if (this.username.length > 2) {
                    localStorage['username'] = this.username;
                    this.createCart();
                } else {
                    alert("Username is too short")
                }
            },
            logout() {
                if (confirm('Do you want to logout?')) {
                    this.username = '';
                    this.cartID = '';
                    localStorage['cartID'] = '';
                    localStorage['username'] = '';
                }
            },
            createCart() {

                if (!this.username) {

                    return Promise.resolve();

                }

                const cartID = localStorage['cartID'];

                if (cartID) {
                    this.cartID = cartID;
                    return Promise.resolve();
                }
                else {
                    const createCartURL = `https://pizza-api.projectcodex.net/api/pizza-cart/create?username${this.username}`
                    return axios.get(createCartURL)
                        .then(result => {
                            this.cartID = result.data.cart_code;
                            localStorage['cartId'] = this.cartID;
                        });
                }
            },

            getCart() {
                const getCartUrl = `https://pizza-api.projectcodex.net/api/pizza-cart/${this.cartID}/get`
                return axios.get(getCartUrl);
            },

            addPizza(pizzaID) {
                return axios.post("https://pizza-api.projectcodex.net/api/pizza-cart/add", {
                    "cart_code": this.cartID,
                    "pizza_id": pizzaID
                })
            },
            removePizza(pizzaID) {

                return axios.post(" https://pizza-api.projectcodex.net/api/pizza-cart/remove", {
                    "cart_code": this.cartID,
                    "pizza_id": pizzaID
                })
            },

            pay(amount) {
                return axios.post("https://pizza-api.projectcodex.net/api/pizza-cart/pay", {
                    "cart_code": this.cartID,
                    amount
                })

            },

            showCartData() {

                this.getCart().then(result => {
                    const cartData = result.data;
                    this.cartPizzas = cartData.pizzas;
                    this.cartTotal = cartData.total.toFixed(2);
                });
            },
            addFeature() {
                const selectFeature = `https://pizza-api.projectcodex.net/api/pizzas/featured?username${this.username}`
                return axios.get(selectFeature);
            },
            featuresThree(pizzaID){

                return axios.post(" https://pizza-api.projectcodex.net//api/pizzas/featured", {
                    "cart_code": this.cartID,
                    "pizza_id": pizzaID
                })
            },

            init() {

                const storedUsername = localStorage['username'];
                if (storedUsername) {
                    this.username = storedUsername;
                }

                axios
                    .get('https://pizza-api.projectcodex.net/api/pizzas')
                    .then(result => {
                        this.pizzas = result.data.pizzas
                    });

                this.getCart().then(result => {

                    const cartData = result.data;

                    this.cartPizzas = cartData.pizzas;
                    this.cartTotal = cartData.total;

                })
                if (!this.cartID) {

                    this
                        .createCart()
                        .then((result) => {
                            this.cartID = result.data.cart_code;
                            this.showCartData();
                        }
                        )
                }

            },

            addPizzasToCart(pizzaID) {

                this.addPizza(pizzaID)
                    .then(() => {
                        this.showCartData();
                    })
            },

            removePizzaFromCart(pizzaID) {
                this.removePizza(pizzaID)
                    .then(() => {
                        this.showCartData();
                    })
            },



            payForCart() {
                this
                    .pay(this.paymentAmount)
                    .then(result => {

                        if (result.data.status == 'failure') {
                            this.message = result.data.message;
                            setTimeout(() => this.message = '', 3000);

                        } else {
                            this.message = 'Payment recieved!';

                            setTimeout(() => {
                                this.message = '';
                                this.cartPizzas = [];
                                this.cartTotal = 0.00;
                                this.cartID = '';
                            }, 3000);
                        }

                    })
            },


        }
    });
});