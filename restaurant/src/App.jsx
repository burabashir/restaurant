
import { useEffect, useMemo, useState } from "react";
import "./App.css";

const INITIAL_MENU = [
  { id: 1, name: "Grilled Beef Tenderloin", category: "Main Course", price: 1850, description: "Tender beef, roasted potatoes, and seasonal vegetables.", image: "photo-1546833999-b9f581a1996d", tag: "Chef's choice" },
  { id: 2, name: "Creamy Tuscan Pasta", category: "Main Course", price: 1250, description: "Creamy sauce, parmesan, herbs, and sun-dried tomatoes.", image: "photo-1473093295043-cdd812d0e601", tag: "Popular" },
  { id: 3, name: "Pan-Seared Salmon", category: "Main Course", price: 2100, description: "Golden salmon, lemon butter, and fresh greens.", image: "photo-1467003909585-2f8a72700288", tag: "Signature" },
  { id: 4, name: "Garden Fresh Salad", category: "Starters", price: 750, description: "Crisp greens, cherry tomatoes, avocado, and house dressing.", image: "photo-1512621776951-a57141f2eefd", tag: "Fresh" },
  { id: 5, name: "Classic Bruschetta", category: "Starters", price: 650, description: "Toasted artisan bread, tomatoes, basil, and olive oil.", image: "photo-1572695157366-5e585ab2b69f", tag: "" },
  { id: 6, name: "Chocolate Lava Cake", category: "Desserts", price: 600, description: "Warm chocolate cake with a molten centre.", image: "photo-1606313564200-e75d5e30476c", tag: "Sweet favourite" },
  { id: 7, name: "Berry Cheesecake", category: "Desserts", price: 550, description: "Creamy cheesecake topped with fresh berries.", image: "photo-1533134242443-d4fd215305ad", tag: "" },
  { id: 8, name: "Passion Mocktail", category: "Drinks", price: 450, description: "Passion fruit, citrus, and refreshing mint.", image: "photo-1513558161293-cdaf765edfd7", tag: "Refreshing" },
  { id: 9, name: "Fresh Lemonade", category: "Drinks", price: 300, description: "Fresh lemon, mint, and ice.", image: "photo-1513558161293-cdaf765edfd7", tag: "" },
];

const CATEGORIES = ["All", "Starters", "Main Course", "Desserts", "Drinks"];
const ADMIN_PASSWORD = "demo123";

const money = (amount) =>
  new Intl.NumberFormat("en-KE", {
    style: "currency",
    currency: "KES",
    maximumFractionDigits: 0,
  }).format(Number(amount) || 0);

const photo = (id) =>
  `https://images.unsplash.com/${id}?auto=format&fit=crop&w=900&q=85`;

function readStorage(key, fallback) {
  try {
    const saved = localStorage.getItem(key);
    return saved ? JSON.parse(saved) : fallback;
  } catch {
    return fallback;
  }
}

function App() {
  const [page, setPage] = useState("home");
  const [category, setCategory] = useState("All");
  const [search, setSearch] = useState("");
  const [mobileOpen, setMobileOpen] = useState(false);
  const [notice, setNotice] = useState("");

  const [menu, setMenu] = useState(() =>
    readStorage("restaurant_menu", INITIAL_MENU)
  );
  const [cart, setCart] = useState({});
  const [orders, setOrders] = useState(() =>
    readStorage("restaurant_orders", [])
  );
  const [reservations, setReservations] = useState(() =>
    readStorage("restaurant_reservations", [])
  );

  const [adminUnlocked, setAdminUnlocked] = useState(false);
  const [adminPassword, setAdminPassword] = useState("");

  const [customer, setCustomer] = useState({
    name: "",
    phone: "",
    email: "",
    address: "",
    method: "Pickup",
  });

  const [reservation, setReservation] = useState({
    name: "",
    email: "",
    phone: "",
    date: "",
    time: "19:00",
    guests: "2",
    notes: "",
  });

  const [newDish, setNewDish] = useState({
    name: "",
    category: "Main Course",
    price: "",
    description: "",
    image: "",
  });

  useEffect(() => {
    localStorage.setItem("restaurant_menu", JSON.stringify(menu));
  }, [menu]);

  useEffect(() => {
    localStorage.setItem("restaurant_orders", JSON.stringify(orders));
  }, [orders]);

  useEffect(() => {
    localStorage.setItem(
      "restaurant_reservations",
      JSON.stringify(reservations)
    );
  }, [reservations]);

  useEffect(() => {
    if (!notice) return undefined;
    const timer = window.setTimeout(() => setNotice(""), 4000);
    return () => window.clearTimeout(timer);
  }, [notice]);

  const visibleMenu = useMemo(() => {
    return menu.filter((item) => {
      const matchesCategory =
        category === "All" || item.category === category;
      const matchesSearch =
        `${item.name} ${item.description}`
          .toLowerCase()
          .includes(search.toLowerCase());

      return matchesCategory && matchesSearch;
    });
  }, [menu, category, search]);

  const cartItems = menu
    .filter((item) => cart[item.id])
    .map((item) => ({ ...item, quantity: cart[item.id] }));

  const cartCount = cartItems.reduce(
    (sum, item) => sum + item.quantity,
    0
  );

  const total = cartItems.reduce(
    (sum, item) => sum + item.price * item.quantity,
    0
  );

  function notify(message) {
    setNotice(message);
  }

  function goTo(nextPage) {
    if (nextPage === "admin" && !adminUnlocked) {
      setPage("admin-login");
    } else {
      setPage(nextPage);
    }

    setMobileOpen(false);
    setNotice("");
    window.scrollTo({ top: 0, behavior: "smooth" });
  }

  function changeQuantity(id, amount) {
    setCart((current) => {
      const next = { ...current };
      const quantity = (next[id] || 0) + amount;

      if (quantity <= 0) {
        delete next[id];
      } else {
        next[id] = quantity;
      }

      return next;
    });
  }

  function submitReservation(event) {
    event.preventDefault();

    const today = new Date();
    const todayString = [
      today.getFullYear(),
      String(today.getMonth() + 1).padStart(2, "0"),
      String(today.getDate()).padStart(2, "0"),
    ].join("-");

    if (reservation.date < todayString) {
      notify("Please select today or a future date.");
      return;
    }

    const booking = {
      ...reservation,
      id: Date.now(),
      status: "Pending",
      createdAt: new Date().toISOString(),
    };

    setReservations((current) => [booking, ...current]);

    setReservation({
      name: "",
      email: "",
      phone: "",
      date: "",
      time: "19:00",
      guests: "2",
      notes: "",
    });

    goTo("home");
    notify(
      "Reservation request saved on this device. Contact the restaurant to confirm."
    );
  }

  function submitOrder(event) {
    event.preventDefault();

    if (!cartItems.length) {
      notify("Your shopping bag is empty.");
      return;
    }

    const order = {
      id: Date.now(),
      customer: { ...customer },
      items: cartItems.map(({ id, name, price, quantity }) => ({
        id,
        name,
        price,
        quantity,
      })),
      total,
      status: "Pending",
      createdAt: new Date().toISOString(),
    };

    setOrders((current) => [order, ...current]);
    setCart({});
    setCustomer({
      name: "",
      phone: "",
      email: "",
      address: "",
      method: "Pickup",
    });

    goTo("home");
    notify(
      "Demo order saved on this device. No payment or restaurant notification was sent."
    );
  }

  function loginAdmin(event) {
    event.preventDefault();

    if (adminPassword === ADMIN_PASSWORD) {
      setAdminUnlocked(true);
      setAdminPassword("");
      goTo("admin");
      notify("Demo admin dashboard opened.");
    } else {
      notify("Incorrect password. For this local demo, use demo123.");
    }
  }

  function logoutAdmin() {
    setAdminUnlocked(false);
    setAdminPassword("");
    goTo("home");
    notify("You have left the demo admin dashboard.");
  }

  function addDish(event) {
    event.preventDefault();

    const price = Number(newDish.price);

    if (!newDish.name.trim() || !newDish.description.trim() || !Number.isFinite(price) || price <= 0) {
      notify("Enter a dish name, description, and valid price.");
      return;
    }

    const imageInput = newDish.image.trim();
    const imageId =
      imageInput.startsWith("photo-")
        ? imageInput
        : "photo-1546069901-ba9599a7e63c";

    const dish = {
      id: Date.now(),
      name: newDish.name.trim(),
      category: newDish.category,
      price,
      description: newDish.description.trim(),
      image: imageId,
      tag: "New",
    };

    setMenu((current) => [dish, ...current]);
    setNewDish({
      name: "",
      category: "Main Course",
      price: "",
      description: "",
      image: "",
    });
    notify("Menu item added successfully.");
  }

  function removeDish(id) {
    setMenu((current) => current.filter((item) => item.id !== id));

    setCart((current) => {
      const next = { ...current };
      delete next[id];
      return next;
    });

    notify("Menu item removed.");
  }

  function updateStatus(type, id, status) {
    if (type === "order") {
      setOrders((current) =>
        current.map((item) =>
          item.id === id ? { ...item, status } : item
        )
      );
    } else {
      setReservations((current) =>
        current.map((item) =>
          item.id === id ? { ...item, status } : item
        )
      );
    }

    notify(`${type === "order" ? "Order" : "Reservation"} status updated.`);
  }

  function FoodCard({ item }) {
    return (
      <article className="food-card">
        <div className="food-photo">
          <img src={photo(item.image)} alt={item.name} loading="lazy" />
          {item.tag && <span className="food-tag">{item.tag}</span>}
          <button
            className="quick-add"
            onClick={() => {
              changeQuantity(item.id, 1);
              notify(`${item.name} added to your bag.`);
            }}
            aria-label={`Add ${item.name} to bag`}
          >
            +
          </button>
        </div>

        <div className="food-info">
          <div>
            <span className="food-category">{item.category}</span>
            <h3>{item.name}</h3>
          </div>
          <strong>{money(item.price)}</strong>
        </div>

        <p>{item.description}</p>
      </article>
    );
  }

  return (
    <div className="site-shell">
      <div className="top-strip">
        <span>NAIROBI · KENYA</span>
        <span>Thoughtfully prepared. Beautifully served.</span>
        <a href="tel:+254700000000">Call us: +254 700 000 000</a>
      </div>

      <header className="navbar">
        <button
  className="brand"
  onClick={() => goTo("home")}
  aria-label="Home"
>
  <img
    src="/restaurant-icon.png"
    alt="Restaurant logo"
    className="restaurant-logo"
  />
  <span className="brand-copy">
    <strong>RESTAURANT</strong>
    <small>THE ART OF DINING</small>
  </span>
</button>

        <button
          className="mobile-toggle"
          onClick={() => setMobileOpen((open) => !open)}
          aria-label="Toggle navigation"
          aria-expanded={mobileOpen}
        >
          {mobileOpen ? "✕" : "☰"}
        </button>

        <nav className={mobileOpen ? "nav-links nav-open" : "nav-links"}>
          <button
            className={page === "home" ? "nav-link active" : "nav-link"}
            onClick={() => goTo("home")}
          >
            Home
          </button>
          <button
            className={page === "menu" ? "nav-link active" : "nav-link"}
            onClick={() => goTo("menu")}
          >
            Our Menu
          </button>
          <button
            className={page === "reservations" ? "nav-link active" : "nav-link"}
            onClick={() => goTo("reservations")}
          >
            Reservations
          </button>
          <button
            className={page === "contact" ? "nav-link active" : "nav-link"}
            onClick={() => goTo("contact")}
          >
            Contact
          </button>
        </nav>

        <div className="nav-actions">
          <button className="cart-button" onClick={() => goTo("checkout")}>
            Bag <span>{cartCount}</span>
          </button>
          <button
            className="button button-gold nav-book"
            onClick={() => goTo("reservations")}
          >
            Book a Table
          </button>
        </div>
      </header>

      {notice && <div className="notice" role="status">{notice}</div>}

      {page === "home" && (
        <main>
          <section className="hero">
            <div className="hero-image" />
            <div className="hero-overlay" />
            <div className="hero-content">
              <span className="eyebrow">
                <span /> GOOD FOOD. GOOD COMPANY.
              </span>
              <h1>
                Where every
                <br />
                meal becomes <em>a memory.</em>
              </h1>
              <p>
                Discover thoughtfully crafted dishes, warm hospitality,
                and an unforgettable dining experience.
              </p>
              <div className="hero-buttons">
                <button className="button button-gold" onClick={() => goTo("menu")}>
                  Explore Our Menu ↗
                </button>
                <button
                  className="button button-outline"
                  onClick={() => goTo("reservations")}
                >
                  Reserve Your Table
                </button>
              </div>
              <div className="hero-rating">
                <span>★★★★★</span>
                <p>Made with care, served with love</p>
              </div>
            </div>
            <div className="hero-side-note">
              A TASTE WORTH REMEMBERING · EST. 2026
            </div>
          </section>

          <section className="intro section-wrap">
            <div>
              <span className="eyebrow dark-eyebrow">WELCOME TO OUR TABLE</span>
              <h2>
                More than a meal.
                <br />
                <em>A little moment of luxury.</em>
              </h2>
            </div>
            <div className="intro-copy">
              <p>
                We believe great food brings people together. Our kitchen
                combines fresh ingredients, inspired recipes, and a genuine
                love of hospitality to create moments worth sharing.
              </p>
              <button className="text-link" onClick={() => goTo("menu")}>
                Discover our menu ↗
              </button>
            </div>
          </section>

          <section className="featured section-wrap">
            <div className="section-heading">
              <div>
                <span className="eyebrow dark-eyebrow">FROM OUR KITCHEN</span>
                <h2>Signature <em>favourites</em></h2>
              </div>
              <button className="text-link" onClick={() => goTo("menu")}>
                View full menu ↗
              </button>
            </div>

            <div className="food-grid">
              {menu.slice(0, 3).map((item) => (
                <FoodCard key={item.id} item={item} />
              ))}
            </div>
          </section>

          <section className="experience">
            <div className="experience-image" />
            <div className="experience-content">
              <span className="eyebrow">YOUR TABLE IS WAITING</span>
              <h2>
                Make time for
                <br />
                <em>something special.</em>
              </h2>
              <p>
                Celebrate a milestone, enjoy an intimate dinner, or simply
                treat yourself to a beautiful evening.
              </p>
              <button
                className="button button-gold"
                onClick={() => goTo("reservations")}
              >
                Reserve a Table ↗
              </button>
            </div>
          </section>

          <section className="contact-strip section-wrap">
            <div>
              <span className="eyebrow dark-eyebrow">COME FIND US</span>
              <h2>We'd love to <em>host you.</em></h2>
            </div>
            <div className="contact-detail">
              <span>⌖</span>
              <div><strong>Our location</strong><p>Nairobi, Kenya</p></div>
            </div>
            <div className="contact-detail">
              <span>◷</span>
              <div><strong>Opening hours</strong><p>Daily · 10 AM – 10 PM</p></div>
            </div>
            <button className="button button-dark" onClick={() => goTo("contact")}>
              Get in Touch ↗
            </button>
          </section>
        </main>
      )}

      {page === "menu" && (
        <main className="page-content">
          <section className="page-banner">
            <span className="eyebrow">A LITTLE SOMETHING FOR EVERYONE</span>
            <h1>Our <em>Menu</em></h1>
            <p>Fresh flavours, beautiful ingredients, unforgettable bites.</p>
          </section>

          <section className="section-wrap menu-section">
            <div className="menu-toolbar">
              <div className="category-list">
                {CATEGORIES.map((item) => (
                  <button
                    key={item}
                    className={category === item ? "category-pill selected" : "category-pill"}
                    onClick={() => setCategory(item)}
                  >
                    {item}
                  </button>
                ))}
              </div>
              <input
                className="search-input"
                value={search}
                onChange={(event) => setSearch(event.target.value)}
                placeholder="Search dishes..."
                aria-label="Search dishes"
              />
            </div>

            <div className="food-grid menu-grid">
              {visibleMenu.map((item) => (
                <FoodCard key={item.id} item={item} />
              ))}
            </div>

            {visibleMenu.length === 0 && (
              <div className="empty-state">No dishes found. Try another search.</div>
            )}

            <div className="menu-bottom">
              <span>{cartCount} item(s) in your bag · {money(total)}</span>
              <button className="button button-dark" onClick={() => goTo("checkout")}>
                Review Your Order ↗
              </button>
            </div>
          </section>
        </main>
      )}

      {page === "checkout" && (
        <main className="page-content">
          <section className="page-banner compact-banner">
            <span className="eyebrow">SOMETHING DELICIOUS IS CLOSE</span>
            <h1>Your <em>Order</em></h1>
          </section>

          <section className="section-wrap checkout-layout">
            <div className="checkout-main">
              <h2>Your selection</h2>

              {!cartItems.length && (
                <div className="empty-state">
                  Your bag is empty.{" "}
                  <button className="text-link" onClick={() => goTo("menu")}>
                    Browse the menu ↗
                  </button>
                </div>
              )}

              {cartItems.map((item) => (
                <div className="cart-row" key={item.id}>
                  <img src={photo(item.image)} alt={item.name} />
                  <div className="cart-item-info">
                    <strong>{item.name}</strong>
                    <span>{money(item.price)} each</span>
                    <div className="quantity-control">
                      <button onClick={() => changeQuantity(item.id, -1)} aria-label="Decrease quantity">−</button>
                      <span>{item.quantity}</span>
                      <button onClick={() => changeQuantity(item.id, 1)} aria-label="Increase quantity">+</button>
                    </div>
                  </div>
                  <strong>{money(item.price * item.quantity)}</strong>
                </div>
              ))}

              <button className="text-link" onClick={() => goTo("menu")}>
                ← Continue browsing
              </button>
            </div>

            <form className="form-card" onSubmit={submitOrder}>
              <span className="eyebrow dark-eyebrow">CHECKOUT</span>
              <h2>Your details</h2>

              <label>
                Full name
                <input required value={customer.name} onChange={(e) => setCustomer({ ...customer, name: e.target.value })} />
              </label>
              <label>
                Phone number
                <input required type="tel" value={customer.phone} onChange={(e) => setCustomer({ ...customer, phone: e.target.value })} placeholder="+254..." />
              </label>
              <label>
                Email address
                <input type="email" value={customer.email} onChange={(e) => setCustomer({ ...customer, email: e.target.value })} />
              </label>
              <label>
                Order type
                <select value={customer.method} onChange={(e) => setCustomer({ ...customer, method: e.target.value })}>
                  <option>Pickup</option>
                  <option>Delivery</option>
                </select>
              </label>
              {customer.method === "Delivery" && (
                <label>
                  Delivery address
                  <textarea required rows="2" value={customer.address} onChange={(e) => setCustomer({ ...customer, address: e.target.value })} />
                </label>
              )}

              <div className="total-line"><span>Total</span><strong>{money(total)}</strong></div>
              <p className="form-note">Demo only: no payment is taken and no order is sent to the restaurant.</p>
              <button className="button button-gold full-button" disabled={!cartItems.length}>
                Place Demo Order ↗
              </button>
            </form>
          </section>
        </main>
      )}

      {page === "reservations" && (
        <main className="page-content">
          <section className="page-banner">
            <span className="eyebrow">YOUR EVENING, BEAUTIFULLY PLANNED</span>
            <h1>Reserve a <em>Table</em></h1>
            <p>Tell us a little about your visit. We'd love to welcome you.</p>
          </section>

          <section className="section-wrap reservation-layout">
            <div className="reservation-note">
              <span className="eyebrow dark-eyebrow">A PLACE AT OUR TABLE</span>
              <h2>Good moments<br />start <em>right here.</em></h2>
              <p>
                For special occasions or larger groups, include a note so
                the restaurant can follow up with you.
              </p>
              <div className="contact-detail">
                <span>◷</span>
                <div><strong>Opening hours</strong><p>Every day, 10 AM – 10 PM</p></div>
              </div>
              <div className="contact-detail">
                <span>☎</span>
                <div><strong>Need help?</strong><p>+254 700 000 000</p></div>
              </div>
            </div>

            <form className="form-card reservation-form" onSubmit={submitReservation}>
              <h2>Booking details</h2>
              <div className="form-row">
                <label>Your name<input required value={reservation.name} onChange={(e) => setReservation({ ...reservation, name: e.target.value })} /></label>
                <label>Phone number<input required type="tel" value={reservation.phone} onChange={(e) => setReservation({ ...reservation, phone: e.target.value })} /></label>
              </div>
              <label>Email address<input required type="email" value={reservation.email} onChange={(e) => setReservation({ ...reservation, email: e.target.value })} /></label>
              <div className="form-row">
                <label>Date<input required type="date" min={new Date().toLocaleDateString("en-CA")} value={reservation.date} onChange={(e) => setReservation({ ...reservation, date: e.target.value })} /></label>
                <label>Time
                  <select value={reservation.time} onChange={(e) => setReservation({ ...reservation, time: e.target.value })}>
                    {["10:00","11:00","12:00","13:00","14:00","15:00","16:00","17:00","18:00","19:00","20:00","21:00"].map((time) => <option key={time}>{time}</option>)}
                  </select>
                </label>
              </div>
              <label>Number of guests
                <select value={reservation.guests} onChange={(e) => setReservation({ ...reservation, guests: e.target.value })}>
                  {["1","2","3","4","5","6","7","8","9","10"].map((n) => <option key={n} value={n}>{n} {n === "1" ? "guest" : "guests"}</option>)}
                </select>
              </label>
              <label>Special requests
                <textarea rows="3" placeholder="Birthday, anniversary, seating preferences..." value={reservation.notes} onChange={(e) => setReservation({ ...reservation, notes: e.target.value })} />
              </label>
              <button className="button button-gold full-button">Request Reservation ↗</button>
              <p className="form-note">This demo stores your request in this browser. Your table is not confirmed until the restaurant confirms it.</p>
            </form>
          </section>
        </main>
      )}

      {page === "contact" && (
        <main className="page-content">
          <section className="page-banner">
            <span className="eyebrow">WE'D LOVE TO HEAR FROM YOU</span>
            <h1>Let's <em>Connect</em></h1>
            <p>Questions, celebrations, or a simple hello — our door is open.</p>
          </section>

          <section className="section-wrap contact-page-grid">
            <div className="contact-cards">
              <article className="contact-card">
                <span>⌖</span><h3>Visit us</h3><p>Nairobi, Kenya</p>
                <small>Replace this with your exact restaurant address.</small>
              </article>
              <article className="contact-card">
                <span>☎</span><h3>Call us</h3><p>+254 700 000 000</p>
                <small>Replace this sample number with your real number.</small>
              </article>
              <article className="contact-card">
                <span>◷</span><h3>Opening hours</h3><p>Daily, 10 AM – 10 PM</p>
                <small>Hours may vary on public holidays.</small>
              </article>
            </div>

            <div className="map-panel">
              <div className="map-pin">⌖</div>
              <h2>Find your way to us</h2>
              <p>Nairobi, Kenya</p>
              <a
                className="button button-dark"
                href="https://www.google.com/maps/search/?api=1&query=restaurants+in+Nairobi+Kenya"
                target="_blank"
                rel="noreferrer"
              >
                Open Google Maps ↗
              </a>
              <small>Update the map link to your restaurant's exact location.</small>
            </div>
          </section>
        </main>
      )}

      {page === "admin-login" && (
        <main className="page-content">
          <section className="page-banner compact-banner">
            <span className="eyebrow">RESTAURANT MANAGEMENT</span>
            <h1>Admin <em>Area</em></h1>
          </section>

          <form className="form-card admin-login-card" onSubmit={loginAdmin}>
            <h2>Administrator access</h2>
            <p className="form-note">
              Local demonstration only. This password is visible in the
              frontend source and does not provide real security.
            </p>
            <label>
              Admin password
              <input
                type="password"
                required
                value={adminPassword}
                onChange={(e) => setAdminPassword(e.target.value)}
                placeholder="Enter demo password"
              />
            </label>
            <button className="button button-gold full-button">Sign In ↗</button>
            <button type="button" className="text-link" onClick={() => goTo("home")}>
              ← Back to website
            </button>
          </form>
        </main>
      )}

      {page === "admin" && adminUnlocked && (
        <main className="page-content section-wrap admin-page">
          <div className="admin-heading">
            <div>
              <span className="eyebrow dark-eyebrow">MANAGEMENT</span>
              <h1>Admin <em>Dashboard</em></h1>
            </div>
            <div className="hero-buttons">
              <button className="button button-dark" onClick={() => goTo("home")}>View Website ↗</button>
              <button className="button button-gold" onClick={logoutAdmin}>Sign Out</button>
            </div>
          </div>

          <div className="stats-grid">
            <div className="stat-card"><span>Total menu items</span><strong>{menu.length}</strong></div>
            <div className="stat-card"><span>Demo orders</span><strong>{orders.length}</strong></div>
            <div className="stat-card"><span>Reservation requests</span><strong>{reservations.length}</strong></div>
            <div className="stat-card"><span>Pending orders</span><strong>{orders.filter((o) => o.status === "Pending").length}</strong></div>
          </div>

          <form className="form-card admin-add-form" onSubmit={addDish}>
            <h2>Add a menu item</h2>
            <div className="form-row">
              <label>Dish name<input required value={newDish.name} onChange={(e) => setNewDish({ ...newDish, name: e.target.value })} /></label>
              <label>Price (KES)<input required type="number" min="1" step="1" value={newDish.price} onChange={(e) => setNewDish({ ...newDish, price: e.target.value })} /></label>
            </div>
            <div className="form-row">
              <label>Section
                <select value={newDish.category} onChange={(e) => setNewDish({ ...newDish, category: e.target.value })}>
                  {CATEGORIES.filter((c) => c !== "All").map((c) => <option key={c}>{c}</option>)}
                </select>
              </label>
              <label>Unsplash photo ID
                <input value={newDish.image} onChange={(e) => setNewDish({ ...newDish, image: e.target.value })} placeholder="photo-1546069901-ba9599a7e63c" />
              </label>
            </div>
            <label>Description<textarea required rows="2" value={newDish.description} onChange={(e) => setNewDish({ ...newDish, description: e.target.value })} /></label>
            <button className="button button-gold">Add Dish +</button>
          </form>

          <section className="admin-table-section">
            <h2>Menu management</h2>
            {menu.length === 0 && <p className="muted">No menu items yet.</p>}
            {menu.map((item) => (
              <div className="admin-row" key={item.id}>
                <span>{item.name} <small>({item.category})</small></span>
                <strong>{money(item.price)}</strong>
                <button className="small-danger" onClick={() => removeDish(item.id)}>Remove</button>
              </div>
            ))}
          </section>

          <section className="admin-table-section">
            <h2>Orders</h2>
            {orders.length === 0 && <p className="muted">No demo orders yet.</p>}
            {orders.map((order) => (
              <div className="admin-record" key={order.id}>
                <div>
                  <strong>#{String(order.id).slice(-6)} · {order.customer.name}</strong>
                  <p>{order.items.map((i) => `${i.name} × ${i.quantity}`).join(", ")}</p>
                  <small>{order.customer.phone} · {order.customer.method}</small>
                  <p>{new Date(order.createdAt).toLocaleString()}</p>
                </div>
                <div>
                  <strong>{money(order.total)}</strong>
                  <select value={order.status} onChange={(e) => updateStatus("order", order.id, e.target.value)} aria-label="Order status">
                    <option>Pending</option><option>Preparing</option><option>Completed</option><option>Cancelled</option>
                  </select>
                </div>
              </div>
            ))}
          </section>

          <section className="admin-table-section">
            <h2>Reservations</h2>
            {reservations.length === 0 && <p className="muted">No demo reservations yet.</p>}
            {reservations.map((item) => (
              <div className="admin-record" key={item.id}>
                <div>
                  <strong>{item.name} · {item.guests} guest(s)</strong>
                  <p>{item.date} at {item.time}</p>
                  <small>{item.phone} · {item.email}</small>
                  {item.notes && <p>{item.notes}</p>}
                </div>
                <select value={item.status} onChange={(e) => updateStatus("reservation", item.id, e.target.value)} aria-label="Reservation status">
                  <option>Pending</option><option>Confirmed</option><option>Completed</option><option>Cancelled</option>
                </select>
              </div>
            ))}
          </section>

          <p className="form-note">
            Demonstration dashboard: records are stored in this browser only.
            Secure authentication and a backend database are required before
            managing real orders, reservations, or customer information.
          </p>
        </main>
      )}

      <footer className="footer">
        <div className="footer-main">
          <button className="brand footer-brand" onClick={() => goTo("home")}>
            <span className="brand-mark">R<span>.</span></span>
            <span className="brand-copy">
              <strong>RESTAURANT</strong>
              <small>THE ART OF DINING</small>
            </span>
          </button>

          <p>Beautiful food. Thoughtful service.<br />Memorable moments.</p>

          <div className="footer-links">
            <button onClick={() => goTo("menu")}>Menu</button>
            <button onClick={() => goTo("reservations")}>Reservations</button>
            <button onClick={() => goTo("contact")}>Contact</button>
            <button onClick={() => goTo("admin")}>Admin</button>
          </div>
        </div>

        <div className="footer-bottom">
          <span>© {new Date().getFullYear()} Restaurant. All rights reserved.</span>
          <span>Crafted for good taste.</span>
        </div>
      </footer>
    </div>
  );
}

export default App;
