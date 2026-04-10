import { useEffect, useRef, useState } from 'react'
import './App.css'
import logo from './assets/logo-new.png'

const DESTACADO_ID = 'p2'
const NUMERO_WHATSAPP = '5491130282746'
const CATEGORY_SECTIONS = [
  { key: 'promos', titulo: 'Promos' },
  { key: 'pizzas', titulo: 'Pizzas' },
]
const PAYMENT_LABELS = {
  efectivo: 'Efectivo',
  transferencia: 'Transferencia / MP',
}

const SERVICE_BADGES = ['Hurlingham', 'Abierto ahora']

const EXTRAS = [
  { id: 'ex1', nombre: 'Coca 1.5L', emoji: '🥤', tipo: 'bebida', precio: 3000 },
  { id: 'ex2', nombre: 'Fainá', emoji: '🫓', tipo: 'acompañamiento', precio: 2500 },
  { id: 'ex3', nombre: 'Empanadas x3', emoji: '🥟', tipo: 'extra', precio: 4000 },
]

const MENU = {
  promos: [
    { id: 'p1', nombre: 'Doble Muzza', desc: '2 muzzarellas', tag: 'Ideal para compartir', precio: 22000 },
    { id: 'p2', nombre: 'Muzza + J&M', desc: '1 muzza + 1 jamón y morrón', tag: 'La más pedida', urgencia: 'Se pide mucho hoy', precio: 26000 },
    { id: 'p3', nombre: 'Triple Muzza', desc: '3 muzzarellas', tag: 'Para toda la banda', precio: 32000 },
    { id: 'p4', nombre: 'Muzza + Jamón', desc: '1 muzza + 1 jamón', tag: 'Clásica y segura', precio: 24000 },
  ],
  pizzas: [
    { id: 's02', nombre: 'Muzarella', desc: 'La de siempre, no falla', precio: 12000 },
    { id: 's07', nombre: 'Tomate y Muzza', desc: 'Tomate y muzzarella', precio: 15000 },
    { id: 's10', nombre: 'Completa', desc: 'Jamón, huevo y morrón', precio: 17000 },
    { id: 's14', nombre: 'Jamón & Morrón', desc: 'Jamón, morrón y muzzarella', precio: 15000 },
    { id: 's17', nombre: 'Cebolla', desc: 'Cebolla y muzzarella', precio: 12000 },
    { id: 's22', nombre: 'Calabresa', desc: 'Calabresa y muzzarella', urgencia: 'Vuela rápido', precio: 15000 },
    { id: 's23', nombre: 'Cheddar & Salchicha', desc: 'Cheddar y salchicha', precio: 20000 },
    { id: 's26', nombre: 'Cheddar & Jamón', desc: 'Cheddar y jamón', precio: 20000 },
    { id: 's27', nombre: 'Napolitana Plus', desc: 'Tomate, huevo y jamón', precio: 17000 },
    { id: 's33', nombre: 'Calabresa Doble', desc: 'Calabresa y muzzarella', precio: 17000 },
    { id: 's37', nombre: 'Jamón & Muzza', desc: 'Jamón y muzzarella', precio: 14000 },
    { id: 's41', nombre: 'Roquefort', desc: 'Jamón y roquefort', precio: 17000 },
    { id: 's45', nombre: 'Cheddar & Huevo', desc: 'Cheddar y huevo', precio: 20000 },
    { id: 's47', nombre: 'Jamón & Tomate', desc: 'Jamón y tomate', precio: 15000 },
    { id: 's50', nombre: 'Huevo & Muzza', desc: 'Muzzarella y huevo', precio: 14000 },
    { id: 's55', nombre: 'Calabresa & Huevo', desc: 'Calabresa y huevo', precio: 15000 },
    { id: 's60', nombre: 'Calabresa & Tomate', desc: 'Calabresa y tomate', precio: 15000 },
  ],
  extras: EXTRAS,
}

const UPSELL_RULES = {
  p1: { ids: ['ex1', 'ex2'], copy: '¿Le sumamos algo?' },
  p2: { ids: ['ex1', 'ex2'], copy: '¿Le sumamos algo?' },
  p3: { ids: ['ex1', 'ex3'], copy: '¿Sumamos bebida o algo más?' },
  p4: { ids: ['ex1', 'ex2'], copy: '¿Le sumamos algo?' },
  s02: { ids: ['ex1', 'ex2'], copy: 'Podés agregar esto' },
  s10: { ids: ['ex1', 'ex3'], copy: '¿Le sumamos algo?' },
  s17: { ids: ['ex1', 'ex2'], copy: 'Podés agregar esto' },
  s22: { ids: ['ex1', 'ex2'], copy: 'Podés agregar esto' },
  s23: { ids: ['ex1', 'ex3'], copy: '¿Le sumamos algo?' },
  s26: { ids: ['ex1', 'ex3'], copy: '¿Le sumamos algo?' },
  s45: { ids: ['ex1', 'ex3'], copy: '¿Le sumamos algo?' },
  _default: { ids: ['ex1', 'ex2', 'ex3'], copy: '¿Le sumamos algo?' },
}

const PRODUCTOS = [...MENU.promos, ...MENU.pizzas, ...EXTRAS]
const PRODUCTOS_POR_ID = Object.fromEntries(PRODUCTOS.map((producto) => [producto.id, producto]))
const DESTACADO = PRODUCTOS_POR_ID[DESTACADO_ID]
const TOP_PICKS = [
  { ...PRODUCTOS_POR_ID.p2, badge: 'La más pedida' },
  { ...PRODUCTOS_POR_ID.p1, badge: 'Combo' },
  { ...PRODUCTOS_POR_ID.s23, badge: 'Premium' },
]

const FORM_INITIAL_STATE = {
  nombre: '',
  direccion: '',
  entreCalles: '',
  metodoPago: 'efectivo',
}

const formatPrecio = (precio) => `$${precio.toLocaleString('es-AR')}`

function getUpsellsForProduct(productId, carrito) {
  const rule = UPSELL_RULES[productId] || UPSELL_RULES._default
  const extras = rule.ids
    .map((id) => PRODUCTOS_POR_ID[id])
    .filter((producto) => producto && !carrito[producto.id])

  return { extras, copy: rule.copy }
}

function createOrderMessage({ carrito, formData, totalPrecio }) {
  const lista = Object.entries(carrito)
    .map(([id, cantidad]) => {
      const producto = PRODUCTOS_POR_ID[id]
      return `• ${producto.nombre}${producto.desc ? ` (${producto.desc})` : ''} x${cantidad} - ${formatPrecio(producto.precio * cantidad)}`
    })
    .join('\n')

  return `🍕 *NUEVO PEDIDO - PIZZARAP* 🍕

*Cliente:* ${formData.nombre}
*Dirección:* ${formData.direccion}
*Entre calles:* ${formData.entreCalles}
*Pago:* ${PAYMENT_LABELS[formData.metodoPago]}

*Pedido:*
${lista}

*TOTAL: ${formatPrecio(totalPrecio)}*`
}

function QuantityControl({ cantidad, onAdd, onSubtract, buttonClassName = 'btn-small' }) {
  return (
    <div className="contador">
      <button className={buttonClassName} onClick={onSubtract} type="button">-</button>
      <span>{cantidad}</span>
      <button className={buttonClassName} onClick={onAdd} type="button">+</button>
    </div>
  )
}

function CategoryTitle({ titulo }) {
  return (
    <h3 className="categoria-titulo">
      <span className="categoria-titulo-text">{titulo}</span>
      <span className="categoria-titulo-line"></span>
    </h3>
  )
}

function ProductCard({ producto, cantidad, isPromo, onAdd, onSubtract }) {
  const isDestacado = producto.id === DESTACADO_ID
  const cardClassName = ['producto-card', isPromo ? 'promo-card' : '', isDestacado ? 'card-destacada' : '']
    .filter(Boolean)
    .join(' ')

  return (
    <div className={cardClassName}>
      {isDestacado && <span className="badge-destacado">La más pedida</span>}
      {producto.tag && !isDestacado && <span className="producto-tag">{producto.tag}</span>}

      <div className="producto-info">
        <p className="precio">{formatPrecio(producto.precio)}</p>
        <h4>{producto.nombre}</h4>
        <p className="producto-desc">{producto.desc}</p>
        {producto.urgencia && <span className="urgencia">🔥 {producto.urgencia}</span>}
      </div>

      <div className="producto-controles">
        {cantidad ? (
          <QuantityControl cantidad={cantidad} onAdd={onAdd} onSubtract={onSubtract} />
        ) : (
          <button
            className={`btn-agregar ${isDestacado ? 'btn-agregar-destacado' : ''}`}
            onClick={onAdd}
            type="button"
          >
            {isDestacado ? 'Pedir esta' : 'Agregar'}
          </button>
        )}
      </div>
    </div>
  )
}

function ExtraCard({ extra, cantidad, onAdd, onSubtract }) {
  return (
    <div className="extra-card">
      <span className="extra-emoji">{extra.emoji}</span>
      <div className="extra-info">
        <span className="extra-nombre">{extra.nombre}</span>
        <span className="extra-precio">+{formatPrecio(extra.precio)}</span>
      </div>
      <div className="producto-controles">
        {cantidad ? (
          <QuantityControl cantidad={cantidad} onAdd={onAdd} onSubtract={onSubtract} />
        ) : (
          <button className="btn-agregar btn-agregar-extra" onClick={onAdd} type="button">
            Sumar
          </button>
        )}
      </div>
    </div>
  )
}

function CategorySection({ titulo, productos, carrito, isPromo, onAdd, onSubtract }) {
  return (
    <div className="categoria">
      <CategoryTitle titulo={titulo} />
      <div className={`productos-grid ${isPromo ? 'promos-grid' : ''}`}>
        {productos.map((producto) => (
          <ProductCard
            key={producto.id}
            cantidad={carrito[producto.id]}
            isPromo={isPromo}
            onAdd={() => onAdd(producto.id)}
            onSubtract={() => onSubtract(producto.id)}
            producto={producto}
          />
        ))}
      </div>
    </div>
  )
}

function CartContent({ carrito, totalItems, onAdd, onSubtract, onSuggest }) {
  if (totalItems === 0) {
    return (
      <div className="carrito-contenido">
        <div className="carrito-vacio">
          <p className="carrito-vacio-titulo">Arrancá por la más pedida</p>
          <button className="carrito-sugerencia" onClick={onSuggest} type="button">
            <span className="carrito-sugerencia-precio">{formatPrecio(DESTACADO.precio)}</span>
            <span className="carrito-sugerencia-nombre">{DESTACADO.nombre}</span>
            <span className="carrito-sugerencia-desc">{DESTACADO.desc}</span>
            <span className="carrito-sugerencia-btn">Agregar ahora</span>
          </button>
        </div>
      </div>
    )
  }

  return (
    <div className="carrito-contenido">
      <div className="carrito-items">
        {Object.entries(carrito).map(([id, cantidad]) => {
          const producto = PRODUCTOS_POR_ID[id]

          if (!producto) {
            return null
          }

          return (
            <div key={id} className="carrito-item">
              <div className="carrito-item-info">
                <span className="carrito-item-nombre">{producto.emoji ? `${producto.emoji} ` : ''}{producto.nombre}</span>
                <span className="cantidad-precio">{cantidad}x {formatPrecio(producto.precio * cantidad)}</span>
              </div>
              <div className="carrito-item-controles">
                <button className="carrito-btn-small" onClick={() => onSubtract(id)} type="button">-</button>
                <span className="carrito-cantidad">{cantidad}</span>
                <button className="carrito-btn-small" onClick={() => onAdd(id)} type="button">+</button>
              </div>
            </div>
          )
        })}
      </div>
    </div>
  )
}

function CartFooter({ totalItems, totalPrecio, onCheckout, onClear }) {
  if (totalItems === 0) {
    return null
  }

  return (
    <div className="carrito-footer">
      <div className="carrito-footer-inner">
        <div className="carrito-footer-total">
          <span className="carrito-footer-label">{totalItems} {totalItems === 1 ? 'item' : 'items'}</span>
          <strong className="carrito-footer-precio">{formatPrecio(totalPrecio)}</strong>
        </div>
        <button className="btn-cta" onClick={onCheckout} type="button">
          <span className="btn-cta-text">Pedir ahora</span>
          <span className="btn-cta-sub">en WhatsApp</span>
        </button>
      </div>
      <button className="btn-limpiar" onClick={onClear} type="button">Vaciar pedido</button>
    </div>
  )
}

function UpsellToast({ data, onAddExtra, onClose }) {
  if (!data) {
    return null
  }

  return (
    <div className="upsell-toast">
      <div className="upsell-toast-header">
        <span className="upsell-toast-check">✓</span>
        <span className="upsell-toast-added">{data.producto.nombre} agregado</span>
        <button className="upsell-toast-close" onClick={onClose} type="button">✕</button>
      </div>
      <p className="upsell-toast-title">{data.copy}</p>
      <div className="upsell-toast-options">
        {data.extras.map((extra) => (
          <button
            key={extra.id}
            className="upsell-toast-btn"
            onClick={() => onAddExtra(extra.id)}
            type="button"
          >
            <span className="upsell-toast-emoji">{extra.emoji}</span>
            <span className="upsell-toast-name">{extra.nombre}</span>
            <span className="upsell-toast-price">+{formatPrecio(extra.precio)}</span>
          </button>
        ))}
      </div>
      <button className="upsell-toast-skip" onClick={onClose} type="button">Continuar sin agregar</button>
    </div>
  )
}

function OrderModal({ formData, onChange, onClose, onSubmit }) {
  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal" onClick={(event) => event.stopPropagation()}>
        <div className="modal-header">
          <h3>Datos de entrega</h3>
          <button className="modal-close" onClick={onClose} type="button">✕</button>
        </div>
        <div className="modal-content">
          <div className="formulario-grupo">
            <label htmlFor="nombre">Nombre</label>
            <input
              className="formulario-input"
              id="nombre"
              name="nombre"
              onChange={onChange}
              placeholder="Tu nombre"
              type="text"
              value={formData.nombre}
            />
          </div>
          <div className="formulario-grupo">
            <label htmlFor="direccion">Dirección con altura</label>
            <input
              className="formulario-input"
              id="direccion"
              name="direccion"
              onChange={onChange}
              placeholder="Ej: Av. Vergara 1234"
              type="text"
              value={formData.direccion}
            />
          </div>
          <div className="formulario-grupo">
            <label htmlFor="entreCalles">Entre calles / Referencia</label>
            <input
              className="formulario-input"
              id="entreCalles"
              name="entreCalles"
              onChange={onChange}
              placeholder="Ej: entre Jujuy y Salta"
              type="text"
              value={formData.entreCalles}
            />
          </div>
          <div className="formulario-grupo">
            <label>Pago</label>
            <div className="metodo-pago">
              {Object.entries(PAYMENT_LABELS).map(([value, label]) => (
                <label key={value} className="radio-option">
                  <input
                    checked={formData.metodoPago === value}
                    name="metodoPago"
                    onChange={onChange}
                    type="radio"
                    value={value}
                  />
                  <span>{label}</span>
                </label>
              ))}
            </div>
          </div>
        </div>
        <div className="modal-footer">
          <button className="modal-cancel" onClick={onClose} type="button">Cancelar</button>
          <button className="modal-confirm" onClick={onSubmit} type="button">Pedir ahora</button>
        </div>
      </div>
    </div>
  )
}

function App() {
  const [carrito, setCarrito] = useState({})
  const [formData, setFormData] = useState(FORM_INITIAL_STATE)
  const [mostrarFormulario, setMostrarFormulario] = useState(false)
  const [carritoMobileOpen, setCarritoMobileOpen] = useState(false)
  const [upsellData, setUpsellData] = useState(null)
  const menuRef = useRef(null)

  const upsellVisible = Boolean(upsellData)
  const totalItems = Object.values(carrito).reduce((total, cantidad) => total + cantidad, 0)
  const totalPrecio = Object.entries(carrito).reduce((total, [id, cantidad]) => {
    const producto = PRODUCTOS_POR_ID[id]
    return total + (producto ? producto.precio * cantidad : 0)
  }, 0)

  const closeUpsell = () => {
    setUpsellData(null)
  }

  useEffect(() => {
    if (!upsellVisible) {
      return undefined
    }

    const timer = setTimeout(closeUpsell, 8000)
    return () => clearTimeout(timer)
  }, [upsellVisible])

  const scrollToMenu = () => {
    menuRef.current?.scrollIntoView({ behavior: 'smooth' })
  }

  const addItem = (id, showUpsell = false) => {
    setCarrito((prevCarrito) => {
      const nextCarrito = { ...prevCarrito, [id]: (prevCarrito[id] || 0) + 1 }

      if (showUpsell) {
        const { extras, copy } = getUpsellsForProduct(id, nextCarrito)

        if (extras.length > 0) {
          setUpsellData({
            copy,
            extras,
            producto: PRODUCTOS_POR_ID[id],
          })
        }
      }

      return nextCarrito
    })
  }

  const removeItem = (id) => {
    setCarrito((prevCarrito) => {
      if (!prevCarrito[id]) {
        return prevCarrito
      }

      const nextCarrito = { ...prevCarrito }

      if (nextCarrito[id] > 1) {
        nextCarrito[id] -= 1
      } else {
        delete nextCarrito[id]
      }

      return nextCarrito
    })
  }

  const handleExtraSelection = (id) => {
    addItem(id)
    closeUpsell()
  }

  const handleFormChange = (event) => {
    const { name, value } = event.target
    setFormData((prevFormData) => ({ ...prevFormData, [name]: value }))
  }

  const handleCheckout = () => {
    const validations = [
      { isValid: formData.nombre.trim(), message: 'Ingresá tu nombre' },
      { isValid: formData.direccion.trim(), message: 'Ingresá tu dirección con altura' },
      { isValid: formData.entreCalles.trim(), message: 'Ingresá las entre calles' },
    ]

    const invalidField = validations.find(({ isValid }) => !isValid)
    if (invalidField) {
      alert(invalidField.message)
      return
    }

    const message = createOrderMessage({ carrito, formData, totalPrecio })
    window.open(`https://wa.me/${NUMERO_WHATSAPP}?text=${encodeURIComponent(message)}`, '_blank')

    setMostrarFormulario(false)
    setCarritoMobileOpen(false)
    setCarrito({})
    setFormData(FORM_INITIAL_STATE)
  }

  return (
    <div className="app-container">
      <section className="hero">
        <div className="hero-content">
          <div className="hero-brand">
            <img src={logo} alt="PizzaRap" className="hero-logo" />
            <div>
              <h1 className="hero-title">PIZZARAP</h1>
              <p className="hero-tagline">Pizzas que no fallan.</p>
            </div>
          </div>

          <div className="hero-info-bar">
            {SERVICE_BADGES.map((item) => (
              <span key={item}>{item}</span>
            ))}
          </div>

          <button className="hero-cta" onClick={scrollToMenu} type="button">
            PEDIR AHORA
          </button>

          <div className="hero-picks">
            {TOP_PICKS.map((producto) => (
              <div key={producto.id} className={`hero-pick ${producto.id === DESTACADO_ID ? 'hero-pick-featured' : ''}`}>
                <span className="hero-pick-badge">{producto.badge}</span>
                <span className="hero-pick-name">{producto.nombre}</span>
                <span className="hero-pick-desc">{producto.desc}</span>
                <span className="hero-pick-price">{formatPrecio(producto.precio)}</span>
                <button className="hero-pick-btn" onClick={() => addItem(producto.id, true)} type="button">
                  {producto.id === DESTACADO_ID ? 'Pedir esta' : 'Agregar'}
                </button>
              </div>
            ))}
          </div>
        </div>
      </section>

      <div className="main-layout" ref={menuRef}>
        <section className="productos-section">
          <div className="menu-header">
            <div>
              <h2>Elegí tu pedido</h2>
            </div>
            <div className="menu-summary">
              <span>{TOP_PICKS.length} destacados</span>
              <span>{MENU.pizzas.length} variedades</span>
              <span>Extras para sumar</span>
            </div>
          </div>

          {CATEGORY_SECTIONS.map(({ key, titulo }) => (
            <CategorySection
              key={key}
              carrito={carrito}
              isPromo={key === 'promos'}
              onAdd={(id) => addItem(id, true)}
              onSubtract={removeItem}
              productos={MENU[key]}
              titulo={titulo}
            />
          ))}

          <div className="categoria">
            <CategoryTitle titulo="Extras" />
            <div className="extras-grid">
              {EXTRAS.map((extra) => (
                <ExtraCard
                  key={extra.id}
                  cantidad={carrito[extra.id]}
                  extra={extra}
                  onAdd={() => addItem(extra.id)}
                  onSubtract={() => removeItem(extra.id)}
                />
              ))}
            </div>
          </div>
        </section>

        <aside className="carrito-section carrito-desktop">
          <div className="carrito-header">
            <h2>Tu pedido</h2>
          </div>
          <CartContent
            carrito={carrito}
            onAdd={addItem}
            onSubtract={removeItem}
            onSuggest={() => addItem(DESTACADO.id, true)}
            totalItems={totalItems}
          />
          <CartFooter
            onCheckout={() => setMostrarFormulario(true)}
            onClear={() => setCarrito({})}
            totalItems={totalItems}
            totalPrecio={totalPrecio}
          />
        </aside>
      </div>

      {upsellVisible && (
        <UpsellToast data={upsellData} onAddExtra={handleExtraSelection} onClose={closeUpsell} />
      )}

      {!carritoMobileOpen && !upsellVisible && (
        <div className="mobile-sticky-bar">
          {totalItems > 0 && (
            <button className="mobile-sticky-info" onClick={() => setCarritoMobileOpen(true)} type="button">
              <span className="mobile-sticky-count">{totalItems}</span>
              <span className="mobile-sticky-total">{formatPrecio(totalPrecio)}</span>
            </button>
          )}
          <button
            className="mobile-sticky-cta"
            onClick={() => (totalItems > 0 ? setMostrarFormulario(true) : scrollToMenu())}
            type="button"
          >
            {totalItems > 0 ? `Pedir ahora · ${formatPrecio(totalPrecio)}` : 'Ver menú'}
          </button>
        </div>
      )}

      {carritoMobileOpen && (
        <div className="carrito-mobile-overlay" onClick={() => setCarritoMobileOpen(false)}>
          <div className="carrito-mobile" onClick={(event) => event.stopPropagation()}>
            <div className="carrito-mobile-header">
              <h2>Tu pedido</h2>
              <button className="modal-close" onClick={() => setCarritoMobileOpen(false)} type="button">✕</button>
            </div>
            <CartContent
              carrito={carrito}
              onAdd={addItem}
              onSubtract={removeItem}
              onSuggest={() => addItem(DESTACADO.id, true)}
              totalItems={totalItems}
            />
            <CartFooter
              onCheckout={() => setMostrarFormulario(true)}
              onClear={() => setCarrito({})}
              totalItems={totalItems}
              totalPrecio={totalPrecio}
            />
          </div>
        </div>
      )}

      {mostrarFormulario && (
        <OrderModal
          formData={formData}
          onChange={handleFormChange}
          onClose={() => setMostrarFormulario(false)}
          onSubmit={handleCheckout}
        />
      )}
    </div>
  )
}

export default App
